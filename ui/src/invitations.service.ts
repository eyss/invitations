import { AppWebsocket, CellId } from '@holochain/conductor-api';
import { AgentPubKey, HeaderHash, InvitationEntryInfo } from './types'

export class InvitationsService {
    
  constructor(
    public appWebsocket: AppWebsocket,
    public cellId: CellId,
    public zomeName = 'invitations'
  ) { }

    async SendInvitation(input: AgentPubKey[]):Promise<void>{
        return this.callZome('send_invitation', input);
    }

    async getMyPendingInvitations():Promise<InvitationEntryInfo[]>{
        return this.callZome('get_my_pending_invitations', null);
    }  

    async acceptInvitation(invitation_header_hash: HeaderHash):Promise<boolean>{
        return this.callZome('accept_invitation', invitation_header_hash);
    }

    async rejectInvitation(invitation_header_hash: HeaderHash):Promise<boolean>{
        return this.callZome('reject_invitation', invitation_header_hash);
    }
    
  private callZome(fn_name: string, payload: any) {
    return this.appWebsocket.callZome({
      cap: null as any,
      cell_id: this.cellId,
      zome_name: this.zomeName,
      fn_name: fn_name,
      payload: payload,
      provenance: this.cellId[1],
    });
  }
}
