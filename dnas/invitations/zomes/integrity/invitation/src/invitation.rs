use hdi::prelude::*;
use chrono::{DateTime, Utc};
#[hdk_entry_helper]
#[derive(Clone, PartialEq)]
pub struct Invitation {
    pub inviter: AgentPubKey,
    pub invitees: Vec<AgentPubKey>,
    pub timestamp: DateTime<Utc>,
}