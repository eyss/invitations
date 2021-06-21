import {
  AgentPubKeyB64,
  EntryHashB64,
  serializeHash,
} from '@holochain-open-dev/core-types';
import { AppWebsocket } from '@holochain/conductor-api';
import {
  observable,
  makeObservable,
  action,
  runInAction,
  computed,
} from 'mobx';

import { InvitationsService } from './invitations.service';

import { Dictionary, InvitationEntryInfo } from './types';

export class InvitationsStore {
  @observable
  public invitations: Dictionary<InvitationEntryInfo> = {};

  constructor(
    protected invitationsService: InvitationsService,
    protected clearOnInvitationComplete: boolean = false
  ) {
    makeObservable(this);

    this.invitationsService.cellClient.addSignalHandler(signal => this.signalHandler(signal))
  }

  isInvitationCompleted(invitationHash: string) {
    const invitation = this.invitations[invitationHash];

    return (
      invitation.invitation.invitees.length ===
      invitation.invitees_who_accepted.length
    );
  }

  get myAgentPubKey() {
    return serializeHash(this.invitationsService.cellClient.cellId[1]);
  }

  @action
  public async fetchMyPendingInvitations(): Promise<void> {
    // Pedir al backend
    const pending_invitations_entries_info: InvitationEntryInfo[] =
      await this.invitationsService.getMyPendingInvitations();

    runInAction(() => {
      // Actualizar los datos dentro del runInAction para hacer trigger del render
      pending_invitations_entries_info.map(invitation_entry_info => {
        this.invitations[invitation_entry_info.invitation_entry_hash] =
          invitation_entry_info;
      });
    });
  }

  @action
  public async sendInvitation(inviteesList: AgentPubKeyB64[]) {
    const create_invitation = await this.invitationsService.sendInvitation(
      inviteesList
    );

    await this.fetchMyPendingInvitations();
  }

  @action
  async acceptInvitation(invitation_entry_hash: EntryHashB64) {
    const accept_invitation = await this.invitationsService.acceptInvitation(
      invitation_entry_hash
    );

    runInAction(() => {
      this.invitations[invitation_entry_hash].invitees_who_accepted.push(
        this.myAgentPubKey
      );

      if (
        this.clearOnInvitationComplete &&
        this.isInvitationCompleted(invitation_entry_hash)
      ) {
        this.clearInvitation(invitation_entry_hash);
      }
    });
  }

  @action
  async rejectInvitation(invitation_entry_hash: EntryHashB64) {
    const reject_invitation = await this.invitationsService.rejectInvitation(
      invitation_entry_hash
    );
    delete this.invitations[invitation_entry_hash];
  }

  @action
  async clearInvitation(invitation_entry_hash: EntryHashB64) {
    await this.invitationsService.clearInvitation(invitation_entry_hash);
    delete this.invitations[invitation_entry_hash];
  }

  @action
  invitationReceived(signal: any) {
    const invitation = signal.payload.InvitationReceived;

    this.invitations[invitation.invitation_entry_hash] = invitation;
  }

  @action
  invitationAccepted(signal: any) {
    const invitation = signal.payload.InvitationAccepted;
    this.invitations[invitation.invitation_entry_hash] = invitation;

    if (
      this.clearOnInvitationComplete &&
      this.isInvitationCompleted(invitation.invitation_entry_hash)
    ) {
      this.clearInvitation(invitation.invitation_entry_hash);
    }
  }

  @action
  invitationRejected(signal: any) {
    const invitation = signal.payload.InvitationRejected;

    this.invitations[invitation.invitation_entry_hash] = invitation;
  }

  @action
  async signalHandler(signal: any) {
    switch (signal.data.payload.name) {
      case 'invitation received':
        this.invitationReceived(signal.data.payload);
        break;

      case 'invitation accepted':
        this.invitationAccepted(signal.data.payload);
        break;

      case 'invitation updated':
        break;

      case 'invitation rejected':
        this.invitationRejected(signal.data.payload);
        break;

      default:
        break;
    }
  }
}
