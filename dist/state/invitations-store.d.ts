import { CellClient } from '@holochain-open-dev/cell-client';
import { AgentPubKeyB64, EntryHashB64, Dictionary } from '@holochain-open-dev/core-types';
import { ProfilesStore } from '@holochain-open-dev/profiles';
import { InvitationsService } from '../invitations-service';
import { Invitation, InvitationEntryInfo } from '../types';
export interface InvitationsConfig {
    clearOnInvitationComplete: boolean;
}
export declare class InvitationsStore {
    protected cellClient: CellClient;
    profilesStore: ProfilesStore;
    config: InvitationsConfig;
    private invitations;
    pendingInvitations: import("svelte/store").Readable<Dictionary<InvitationEntryInfo>>;
    invitationsService: InvitationsService;
    constructor(cellClient: CellClient, profilesStore: ProfilesStore, config?: InvitationsConfig);
    invitationInfo(invitationHash: EntryHashB64): import("svelte/store").Readable<InvitationEntryInfo>;
    get myAgentPubKey(): string;
    fetchMyPendingInvitations(): Promise<void>;
    sendInvitation(inviteesList: AgentPubKeyB64[]): Promise<void>;
    acceptInvitation(invitation_entry_hash: EntryHashB64, retryCount?: number): Promise<unknown>;
    rejectInvitation(invitation_entry_hash: EntryHashB64, retryCount?: number): Promise<void>;
    clearInvitation(invitation_entry_hash: EntryHashB64): Promise<void>;
    fetchProfilesForInvitation(invitation: Invitation, retryCount?: number): Promise<void>;
    invitationReceived(signal: any): Promise<void>;
    invitationAccepted(signal: any): Promise<void>;
    invitationRejected(signal: any): void;
    signalHandler(signal: any): Promise<void>;
}
