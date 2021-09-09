import { CellClient } from '@holochain-open-dev/cell-client';
import { AgentPubKeyB64, EntryHashB64, Dictionary } from '@holochain-open-dev/core-types';
import { InvitationsService } from '../invitations-service';
import { InvitationEntryInfo } from '../types';
export declare class InvitationsStore {
    protected cellClient: CellClient;
    protected clearOnInvitationComplete: boolean;
    private invitations;
    pendingInvitations: import("svelte/store").Readable<Dictionary<InvitationEntryInfo>>;
    invitationsService: InvitationsService;
    constructor(cellClient: CellClient, clearOnInvitationComplete?: boolean);
    invitationInfo(invitationHash: EntryHashB64): import("svelte/store").Readable<InvitationEntryInfo>;
    get myAgentPubKey(): string;
    fetchMyPendingInvitations(): Promise<void>;
    sendInvitation(inviteesList: AgentPubKeyB64[]): Promise<void>;
    acceptInvitation(invitation_entry_hash: EntryHashB64): Promise<unknown>;
    rejectInvitation(invitation_entry_hash: EntryHashB64): Promise<void>;
    clearInvitation(invitation_entry_hash: EntryHashB64): Promise<void>;
    invitationReceived(signal: any): void;
    invitationAccepted(signal: any): Promise<void>;
    invitationRejected(signal: any): void;
    signalHandler(signal: any): Promise<void>;
}
