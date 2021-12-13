import { CellClient } from '@holochain-open-dev/cell-client';
import {
  AgentPubKeyB64,
  EntryHashB64,
  Dictionary,
  serializeHash,
} from '@holochain-open-dev/core-types';
import { ProfilesStore } from '@holochain-open-dev/profiles';
import { writable, Writable, derived, get } from 'svelte/store';

import { InvitationsService } from '../invitations-service';

import { Invitation, InvitationEntryInfo } from '../types';
import { sleep } from '../utils';
import { getAllAgentsFor, isInvitationCompleted } from './selectors';

export interface InvitationsConfig {
  clearOnInvitationComplete: boolean;
}

export class InvitationsStore {
  private invitations: Writable<Dictionary<InvitationEntryInfo>> = writable({});

  public pendingInvitations = derived(this.invitations, invitations => {
    const pending: Dictionary<InvitationEntryInfo> = {};

    for (const [hash, info] of Object.entries(invitations)) {
      if (!isInvitationCompleted(invitations[hash])) {
        pending[hash] = info;
      }
    }

    return pending;
  });

  invitationsService: InvitationsService;

  constructor(
    protected cellClient: CellClient,
    protected profilesStore: ProfilesStore,
    protected config: InvitationsConfig = {
      clearOnInvitationComplete: false,
    }
  ) {
    this.invitationsService = new InvitationsService(cellClient);
    this.invitationsService.cellClient.addSignalHandler(s =>
      this.signalHandler(s)
    );
  }

  invitationInfo(invitationHash: EntryHashB64) {
    return derived(
      this.invitations,
      invitations => invitations[invitationHash]
    );
  }

  get myAgentPubKey() {
    return serializeHash(this.invitationsService.cellClient.cellId[1]);
  }

  public async fetchMyPendingInvitations(): Promise<void> {
    // Pedir al backend
    const pending_invitations_entries_info: InvitationEntryInfo[] =
      await this.invitationsService.getMyPendingInvitations();

    const promises = pending_invitations_entries_info.map(i =>
      this.fetchProfilesForInvitation(i.invitation)
    );
    await Promise.all(promises);

    this.invitations.update(invitations => {
      pending_invitations_entries_info.map(invitation_entry_info => {
        invitations[invitation_entry_info.invitation_entry_hash] =
          invitation_entry_info;
      });
      return invitations;
    });
  }

  public async sendInvitation(inviteesList: AgentPubKeyB64[]) {
    const create_invitation = await this.invitationsService.sendInvitation(
      inviteesList
    );

    await this.fetchMyPendingInvitations();
  }

  async acceptInvitation(invitation_entry_hash: EntryHashB64) {
    const accept_invitation = await this.invitationsService.acceptInvitation(
      invitation_entry_hash
    );

    return new Promise(resolve => {
      this.invitations.update(invitations => {
        const invitationInfo = invitations[invitation_entry_hash];
        invitationInfo.invitees_who_accepted.push(this.myAgentPubKey);

        if (
          this.config.clearOnInvitationComplete &&
          isInvitationCompleted(invitationInfo)
        ) {
          this.clearInvitation(invitation_entry_hash).then(() => resolve(null));
        } else {
          resolve(null);
        }
        return invitations;
      });
    });
  }

  async rejectInvitation(invitation_entry_hash: EntryHashB64) {
    const reject_invitation = await this.invitationsService.rejectInvitation(
      invitation_entry_hash
    );
    this.invitations.update(invitations => {
      delete invitations[invitation_entry_hash];
      return invitations;
    });
  }

  async clearInvitation(invitation_entry_hash: EntryHashB64) {
    await this.invitationsService.clearInvitation(invitation_entry_hash);
  }

  async fetchProfilesForInvitation(
    invitation: Invitation,
    retryCount = 4
  ): Promise<void> {
    if (retryCount === 0) {
      return;
    }

    const agents = getAllAgentsFor(invitation);

    await this.profilesStore.fetchAgentsProfiles(agents);

    const knownProfiles = get(this.profilesStore.knownProfiles);

    if (agents.some(agent => !knownProfiles[agent])) {
      await sleep(1500);

      return this.fetchProfilesForInvitation(invitation, retryCount - 1);
    }
  }

  async invitationReceived(signal: any) {
    const invitation = signal.payload.InvitationReceived;

    await this.fetchProfilesForInvitation(invitation.invitation);

    this.invitations.update(invitations => {
      invitations[invitation.invitation_entry_hash] = invitation;
      return invitations;
    });
  }

  async invitationAccepted(signal: any) {
    const invitation = signal.payload.InvitationAccepted;
    this.invitations.update(invitations => {
      invitations[invitation.invitation_entry_hash] = invitation;
      return invitations;
    });

    if (
      this.config.clearOnInvitationComplete &&
      isInvitationCompleted(invitation)
    ) {
      await this.clearInvitation(invitation.invitation_entry_hash);
    }
  }

  invitationRejected(signal: any) {
    const invitation = signal.payload.InvitationRejected;

    this.invitations.update(invitations => {
      invitations[invitation.invitation_entry_hash] = invitation;
      return invitations;
    });
  }

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
