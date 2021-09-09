import { serializeHash, } from '@holochain-open-dev/core-types';
import { writable, derived } from 'svelte/store';
import { InvitationsService } from '../invitations-service';
import { isInvitationCompleted } from './selectors';
export class InvitationsStore {
    constructor(cellClient, clearOnInvitationComplete = false) {
        this.cellClient = cellClient;
        this.clearOnInvitationComplete = clearOnInvitationComplete;
        this.invitations = writable({});
        this.pendingInvitations = derived(this.invitations, invitations => {
            const pending = {};
            for (const [hash, info] of Object.entries(invitations)) {
                if (!isInvitationCompleted(invitations[hash])) {
                    pending[hash] = info;
                }
            }
            return pending;
        });
        this.invitationsService = new InvitationsService(cellClient);
        this.invitationsService.cellClient.addSignalHandler(this.signalHandler);
    }
    invitationInfo(invitationHash) {
        return derived(this.invitations, invitations => invitations[invitationHash]);
    }
    get myAgentPubKey() {
        return serializeHash(this.invitationsService.cellClient.cellId[1]);
    }
    async fetchMyPendingInvitations() {
        // Pedir al backend
        const pending_invitations_entries_info = await this.invitationsService.getMyPendingInvitations();
        this.invitations.update(invitations => {
            pending_invitations_entries_info.map(invitation_entry_info => {
                invitations[invitation_entry_info.invitation_entry_hash] =
                    invitation_entry_info;
            });
            return invitations;
        });
    }
    async sendInvitation(inviteesList) {
        const create_invitation = await this.invitationsService.sendInvitation(inviteesList);
        await this.fetchMyPendingInvitations();
    }
    async acceptInvitation(invitation_entry_hash) {
        const accept_invitation = await this.invitationsService.acceptInvitation(invitation_entry_hash);
        return new Promise(resolve => {
            this.invitations.update(invitations => {
                const invitationInfo = invitations[invitation_entry_hash];
                invitationInfo.invitees_who_accepted.push(this.myAgentPubKey);
                if (this.clearOnInvitationComplete &&
                    isInvitationCompleted(invitationInfo)) {
                    this.clearInvitation(invitation_entry_hash).then(() => resolve(null));
                }
                else {
                    resolve(null);
                }
                return invitations;
            });
        });
    }
    async rejectInvitation(invitation_entry_hash) {
        const reject_invitation = await this.invitationsService.rejectInvitation(invitation_entry_hash);
        this.invitations.update(invitations => {
            delete invitations[invitation_entry_hash];
            return invitations;
        });
    }
    async clearInvitation(invitation_entry_hash) {
        await this.invitationsService.clearInvitation(invitation_entry_hash);
    }
    invitationReceived(signal) {
        const invitation = signal.payload.InvitationReceived;
        this.invitations.update(invitations => {
            invitations[invitation.invitation_entry_hash] = invitation;
            return invitations;
        });
    }
    async invitationAccepted(signal) {
        const invitation = signal.payload.InvitationAccepted;
        this.invitations.update(invitations => {
            invitations[invitation.invitation_entry_hash] = invitation;
            return invitations;
        });
        if (this.clearOnInvitationComplete && isInvitationCompleted(invitation)) {
            await this.clearInvitation(invitation.invitation_entry_hash);
        }
    }
    invitationRejected(signal) {
        const invitation = signal.payload.InvitationRejected;
        this.invitations.update(invitations => {
            invitations[invitation.invitation_entry_hash] = invitation;
            return invitations;
        });
    }
    async signalHandler(signal) {
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
//# sourceMappingURL=invitations-store.js.map