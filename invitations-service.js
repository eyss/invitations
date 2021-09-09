export class InvitationsService {
    constructor(cellClient, zomeName = 'invitations') {
        this.cellClient = cellClient;
        this.zomeName = zomeName;
    }
    async sendInvitation(input) {
        return this.callZome('send_invitation', input);
    }
    async getMyPendingInvitations() {
        return this.callZome('get_my_pending_invitations', null);
    }
    async acceptInvitation(invitation_header_hash) {
        return this.callZome('accept_invitation', invitation_header_hash);
    }
    async rejectInvitation(invitation_header_hash) {
        return this.callZome('reject_invitation', invitation_header_hash);
    }
    async clearInvitation(invitation_header_hash) {
        return this.callZome('clear_invitation', invitation_header_hash);
    }
    callZome(fn_name, payload) {
        return this.cellClient.callZome(this.zomeName, fn_name, payload);
    }
}
//# sourceMappingURL=invitations-service.js.map