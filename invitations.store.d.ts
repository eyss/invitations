import { InvitationsService } from './invitations.service';
import { ProfilesStore } from '@holochain-open-dev/profiles';
import { AgentPubKey, Dictionary, InvitationEntryInfo, EntryHash } from './types';
export declare class InvitationsStore {
    protected invitationsService: InvitationsService;
    profilesStore: ProfilesStore;
    protected clearOnInvitationComplete: boolean;
    invitations: Dictionary<InvitationEntryInfo>;
    constructor(invitationsService: InvitationsService, profilesStore: ProfilesStore, clearOnInvitationComplete?: boolean);
    isInvitationCompleted(invitationHash: string): boolean;
    fetchMyPendingInvitations(): Promise<void>;
    sendInvitation(inviteesList: AgentPubKey[]): Promise<void>;
    acceptInvitation(invitation_entry_hash: EntryHash): Promise<void>;
    rejectInvitation(invitation_entry_hash: EntryHash): Promise<void>;
    clearInvitation(invitation_entry_hash: EntryHash): Promise<void>;
    invitationReceived(signal: any): void;
    invitationAccepted(signal: any): void;
    invitationRejected(signal: any): void;
    signalHandler(signal: any): Promise<void>;
}
