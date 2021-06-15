import { CellClient } from '@holochain-open-dev/cell-client';
import { AgentPubKey, HeaderHash, InvitationEntryInfo } from './types';
export declare class InvitationsService {
    cellClient: CellClient;
    zomeName: string;
    constructor(cellClient: CellClient, zomeName?: string);
    sendInvitation(input: AgentPubKey[]): Promise<void>;
    getMyPendingInvitations(): Promise<InvitationEntryInfo[]>;
    acceptInvitation(invitation_header_hash: HeaderHash): Promise<boolean>;
    rejectInvitation(invitation_header_hash: HeaderHash): Promise<boolean>;
    clearInvitation(invitation_header_hash: HeaderHash): Promise<boolean>;
    private callZome;
}
