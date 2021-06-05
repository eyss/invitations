import { AgentPubKeyB64, HeaderHashB64 } from '@holochain-open-dev/core-types';
import { AppWebsocket, CellId } from '@holochain/conductor-api';
import { InvitationEntryInfo } from './types';
export declare class InvitationsService {
    appWebsocket: AppWebsocket;
    cellId: CellId;
    zomeName: string;
    constructor(appWebsocket: AppWebsocket, cellId: CellId, zomeName?: string);
    sendInvitation(input: AgentPubKeyB64[]): Promise<void>;
    getMyPendingInvitations(): Promise<InvitationEntryInfo[]>;
    acceptInvitation(invitation_header_hash: HeaderHashB64): Promise<boolean>;
    rejectInvitation(invitation_header_hash: HeaderHashB64): Promise<boolean>;
    clearInvitation(invitation_header_hash: HeaderHashB64): Promise<boolean>;
    private callZome;
}
