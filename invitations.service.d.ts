import { AppWebsocket, CellId } from '@holochain/conductor-api';
import { AgentPubKey, HeaderHash, InvitationEntryInfo } from './types';
export declare class InvitationsService {
    appWebsocket: AppWebsocket;
    cellId: CellId;
    zomeName: string;
    constructor(appWebsocket: AppWebsocket, cellId: CellId, zomeName?: string);
    sendInvitation(input: AgentPubKey[]): Promise<void>;
    getMyPendingInvitations(): Promise<InvitationEntryInfo[]>;
    acceptInvitation(invitation_header_hash: HeaderHash): Promise<boolean>;
    rejectInvitation(invitation_header_hash: HeaderHash): Promise<boolean>;
    clearInvitation(invitation_header_hash: HeaderHash): Promise<boolean>;
    private callZome;
}
