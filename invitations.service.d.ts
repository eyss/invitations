import { CellClient } from '@holochain-open-dev/cell-client';
import { AgentPubKeyB64, HeaderHashB64 } from '@holochain-open-dev/core-types';
import { InvitationEntryInfo } from './types';
export declare class InvitationsService {
    cellClient: CellClient;
    zomeName: string;
    constructor(cellClient: CellClient, zomeName?: string);
    sendInvitation(input: AgentPubKeyB64[]): Promise<void>;
    getMyPendingInvitations(): Promise<InvitationEntryInfo[]>;
    acceptInvitation(invitation_header_hash: HeaderHashB64): Promise<boolean>;
    rejectInvitation(invitation_header_hash: HeaderHashB64): Promise<boolean>;
    clearInvitation(invitation_header_hash: HeaderHashB64): Promise<boolean>;
    private callZome;
}
