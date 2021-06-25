import { __decorate } from "tslib";
import { serializeHash, } from '@holochain-open-dev/core-types';
import { observable, makeObservable, action, runInAction, } from 'mobx';
export class InvitationsStore {
    constructor(invitationsService, clearOnInvitationComplete = false) {
        this.invitationsService = invitationsService;
        this.clearOnInvitationComplete = clearOnInvitationComplete;
        this.invitations = {};
        makeObservable(this);
        this.invitationsService.cellClient.addSignalHandler(signal => this.signalHandler(signal));
    }
    isInvitationCompleted(invitationHash) {
        const invitation = this.invitations[invitationHash];
        return (invitation.invitation.invitees.length ===
            invitation.invitees_who_accepted.length);
    }
    get myAgentPubKey() {
        return serializeHash(this.invitationsService.cellClient.cellId[1]);
    }
    get pendingInvitations() {
        const pending = {};
        for (const [hash, info] of Object.entries(this.invitations)) {
            if (this.isInvitationCompleted(hash)) {
                pending[hash] = info;
            }
        }
        return pending;
    }
    invitationInfo(invitationEntryHash) {
        return this.invitations[invitationEntryHash];
    }
    async fetchMyPendingInvitations() {
        // Pedir al backend
        const pending_invitations_entries_info = await this.invitationsService.getMyPendingInvitations();
        runInAction(() => {
            // Actualizar los datos dentro del runInAction para hacer trigger del render
            pending_invitations_entries_info.map(invitation_entry_info => {
                this.invitations[invitation_entry_info.invitation_entry_hash] =
                    invitation_entry_info;
            });
        });
    }
    async sendInvitation(inviteesList) {
        const create_invitation = await this.invitationsService.sendInvitation(inviteesList);
        await this.fetchMyPendingInvitations();
    }
    async acceptInvitation(invitation_entry_hash) {
        const accept_invitation = await this.invitationsService.acceptInvitation(invitation_entry_hash);
        return new Promise(resolve => {
            runInAction(() => {
                this.invitations[invitation_entry_hash].invitees_who_accepted.push(this.myAgentPubKey);
                if (this.clearOnInvitationComplete &&
                    this.isInvitationCompleted(invitation_entry_hash)) {
                    this.clearInvitation(invitation_entry_hash).then(() => resolve(null));
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    async rejectInvitation(invitation_entry_hash) {
        const reject_invitation = await this.invitationsService.rejectInvitation(invitation_entry_hash);
        delete this.invitations[invitation_entry_hash];
    }
    async clearInvitation(invitation_entry_hash) {
        await this.invitationsService.clearInvitation(invitation_entry_hash);
    }
    invitationReceived(signal) {
        const invitation = signal.payload.InvitationReceived;
        this.invitations[invitation.invitation_entry_hash] = invitation;
    }
    invitationAccepted(signal) {
        const invitation = signal.payload.InvitationAccepted;
        this.invitations[invitation.invitation_entry_hash] = invitation;
        if (this.clearOnInvitationComplete &&
            this.isInvitationCompleted(invitation.invitation_entry_hash)) {
            this.clearInvitation(invitation.invitation_entry_hash);
        }
    }
    invitationRejected(signal) {
        const invitation = signal.payload.InvitationRejected;
        this.invitations[invitation.invitation_entry_hash] = invitation;
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
__decorate([
    observable
], InvitationsStore.prototype, "invitations", void 0);
__decorate([
    action
], InvitationsStore.prototype, "fetchMyPendingInvitations", null);
__decorate([
    action
], InvitationsStore.prototype, "sendInvitation", null);
__decorate([
    action
], InvitationsStore.prototype, "acceptInvitation", null);
__decorate([
    action
], InvitationsStore.prototype, "rejectInvitation", null);
__decorate([
    action
], InvitationsStore.prototype, "clearInvitation", null);
__decorate([
    action
], InvitationsStore.prototype, "invitationReceived", null);
__decorate([
    action
], InvitationsStore.prototype, "invitationAccepted", null);
__decorate([
    action
], InvitationsStore.prototype, "invitationRejected", null);
__decorate([
    action
], InvitationsStore.prototype, "signalHandler", null);
//# sourceMappingURL=invitations.store.js.map