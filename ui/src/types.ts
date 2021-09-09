import {
  AgentPubKeyB64,
  EntryHashB64,
  HeaderHashB64,
} from '@holochain-open-dev/core-types';

export interface Invitation {
  inviter: AgentPubKeyB64;
  invitees: AgentPubKeyB64[];
  timestamp: any;
}

export interface InvitationEntryInfo {
  invitation: Invitation;
  invitation_entry_hash: EntryHashB64;
  invitation_header_hash: HeaderHashB64;
  invitees_who_accepted: AgentPubKeyB64[];
  invitees_who_rejected: AgentPubKeyB64[];
}

export enum InvitationStatus {
  Pending,
  Completed,
  Rejected
}