import { AgentPubKeyB64, EntryHashB64 } from '@holochain-open-dev/core-types';
import { InvitationsService } from './invitations.service';
import { Dictionary, InvitationEntryInfo } from './types';
export declare class InvitationsStore {
    protected invitationsService: InvitationsService;
    protected clearOnInvitationComplete: boolean;
    invitations: Dictionary<InvitationEntryInfo>;
    constructor(invitationsService: InvitationsService, clearOnInvitationComplete?: boolean);
    isInvitationCompleted(invitationHash: string): boolean;
    get myAgentPubKey(): string;
    fetchMyPendingInvitations(): Promise<void>;
    sendInvitation(inviteesList: AgentPubKeyB64[]): Promise<void>;
    acceptInvitation(invitation_entry_hash: EntryHashB64): Promise<void>;
    rejectInvitation(invitation_entry_hash: EntryHashB64): Promise<void>;
    clearInvitation(invitation_entry_hash: EntryHashB64): Promise<void>;
    invitationReceived(signal: any): void;
    invitationAccepted(signal: any): void;
    invitationRejected(signal: any): void;
    signalHandler(signal: any): Promise<void>;
}
