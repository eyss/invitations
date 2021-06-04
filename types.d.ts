export declare type AgentPubKey = string;
export declare type HeaderHash = string;
export declare type EntryHash = string;
export interface Invitation {
    inviter: AgentPubKey;
    invitees: AgentPubKey[];
    timestamp: any;
}
export interface InvitationEntryInfo {
    invitation: Invitation;
    invitation_entry_hash: EntryHash;
    invitation_header_hash: HeaderHash;
    invitees_who_accepted: AgentPubKey[];
    invitees_who_rejected: AgentPubKey[];
}
export declare type Dictionary<T> = {
    [key: string]: T;
};
export declare const INVITATIONS_STORE_CONTEXT = "hc_zome_invitations/store";
