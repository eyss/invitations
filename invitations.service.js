export class InvitationsService {
    constructor(appWebsocket, cellId, zomeName = 'invitations') {
        this.appWebsocket = appWebsocket;
        this.cellId = cellId;
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
        return this.appWebsocket.callZome({
            cap: null,
            cell_id: this.cellId,
            zome_name: this.zomeName,
            fn_name: fn_name,
            payload: payload,
            provenance: this.cellId[1],
        });
    }
}
//# sourceMappingURL=invitations.service.js.map