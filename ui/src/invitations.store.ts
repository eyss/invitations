import {
  observable,
  makeObservable,
  action,
  runInAction,
  computed,
} from 'mobx';

import { InvitationsService } from './invitations.service';
import { ProfilesService, ProfilesStore } from '@holochain-open-dev/profiles';

import {
  AgentPubKey,
  HeaderHash,
  Invitation,
  Dictionary,
  InvitationEntryInfo,
  EntryHash,
} from './types';
import { table } from 'console';

export class InvitationsStore {
  @observable
  public invitations: Dictionary<InvitationEntryInfo> = {};

  constructor(
    protected invitationsService: InvitationsService,
    public profilesStore: ProfilesStore,
    protected clearOnInvitationComplete: boolean = false
  ) {
    makeObservable(this);
  }

  isInvitationCompleted(invitationHash: string) {
    const invitation = this.invitations[invitationHash];

    return (
      invitation.invitation.invitees.length ===
      invitation.invitees_who_accepted.length
    );
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
  public async sendInvitation(inviteesList: AgentPubKey[]) {
    const create_invitation = await this.invitationsService.sendInvitation(
      inviteesList
    );

    await this.fetchMyPendingInvitations();
  }

  @action
  async acceptInvitation(invitation_entry_hash: EntryHash) {
    const accept_invitation = await this.invitationsService.acceptInvitation(
      invitation_entry_hash
    );

    runInAction(() => {
      this.invitations[invitation_entry_hash].invitees_who_accepted.push(
        this.profilesStore.myAgentPubKey
      );

      if (
        this.clearOnInvitationComplete &&
        this.isInvitationCompleted(invitation_entry_hash)
        ) {
        console.log(this.invitations[invitation_entry_hash], 'cleared');
        this.clearInvitation(invitation_entry_hash);
      }
    });
  }

  @action
  async rejectInvitation(invitation_entry_hash: EntryHash) {
    const reject_invitation = await this.invitationsService.rejectInvitation(
      invitation_entry_hash
    );
    delete this.invitations[invitation_entry_hash];
  }

  @action
  async clearInvitation(invitation_entry_hash: EntryHash) {
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
