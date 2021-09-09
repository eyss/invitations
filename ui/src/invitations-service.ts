import { CellClient } from '@holochain-open-dev/cell-client';
import { AgentPubKeyB64, HeaderHashB64 } from '@holochain-open-dev/core-types';
import { InvitationEntryInfo } from './types';

export class InvitationsService {
  constructor(public cellClient: CellClient, public zomeName = 'invitations') {}

  async sendInvitation(input: AgentPubKeyB64[]): Promise<void> {
    return this.callZome('send_invitation', input);
  }

  async getMyPendingInvitations(): Promise<InvitationEntryInfo[]> {
    return this.callZome('get_my_pending_invitations', null);
  }

  async acceptInvitation(
    invitation_header_hash: HeaderHashB64
  ): Promise<boolean> {
    return this.callZome('accept_invitation', invitation_header_hash);
  }

  async rejectInvitation(
    invitation_header_hash: HeaderHashB64
  ): Promise<boolean> {
    return this.callZome('reject_invitation', invitation_header_hash);
  }

  async clearInvitation(
    invitation_header_hash: HeaderHashB64
  ): Promise<boolean> {
    return this.callZome('clear_invitation', invitation_header_hash);
  }

  private callZome(fn_name: string, payload: any) {
    return this.cellClient.callZome(this.zomeName, fn_name, payload);
  }
}
