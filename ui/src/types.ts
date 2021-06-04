export type AgentPubKey = string;
export type HeaderHash = string;
export type EntryHash = string;

export interface Invitation{
    inviter: AgentPubKey,
    invitees: AgentPubKey[],
    timestamp: any    
}

export interface InvitationEntryInfo{
    invitation: Invitation,
    invitation_entry_hash: EntryHash,
    invitation_header_hash: HeaderHash,
    invitees_who_accepted: AgentPubKey[],
    invitees_who_rejected: AgentPubKey[],
}

export type Dictionary<T> = { [key: string]: T };

export const INVITATIONS_STORE_CONTEXT = 'hc_zome_invitations/store';