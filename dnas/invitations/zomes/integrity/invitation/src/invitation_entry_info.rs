use hdi::prelude::*;
use crate::Invitation;

#[hdk_entry_helper]
#[derive(Clone, PartialEq)]
pub struct InvitationEntryInfo {
  pub invitation: Invitation,
  pub invitation_entry_hash: EntryHash,
  pub invitation_action_hash: ActionHash,
  pub invitees_who_accepted: Vec<AgentPubKey>,
  pub invitees_who_rejected: Vec<AgentPubKey>,
}