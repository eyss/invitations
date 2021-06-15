// import { AppWebsocket, CellId } from '@holochain/conductor-api';
import { CellClient } from '@holochain-open-dev/cell-client';
import { AgentPubKey, HeaderHash, InvitationEntryInfo } from './types';

export class InvitationsService {

  constructor(public cellClient: CellClient, public zomeName = 'invitations') {}

  async sendInvitation(input: AgentPubKey[]): Promise<void> {
    return this.callZome('send_invitation', input);
  }

  async getMyPendingInvitations(): Promise<InvitationEntryInfo[]> {
    return this.callZome('get_my_pending_invitations', null);
  }

  async acceptInvitation(invitation_header_hash: HeaderHash): Promise<boolean> {
    return this.callZome('accept_invitation', invitation_header_hash);
  }

  async rejectInvitation(invitation_header_hash: HeaderHash): Promise<boolean> {
    return this.callZome('reject_invitation', invitation_header_hash);
  }

  async clearInvitation(invitation_header_hash: HeaderHash): Promise<boolean> {
    return this.callZome('clear_invitation', invitation_header_hash);
  }

  private callZome(fn_name: string, payload: any) {
    return this.cellClient.callZome(this.zomeName, fn_name, payload);
  }
}
