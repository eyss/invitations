use hdk::prelude::*;
use std::time::Duration;

pub mod handlers;

#[derive(Clone, Debug, Serialize, Deserialize, SerializedBytes)]
pub struct Invitation {
    pub inviter: AgentPubKey,
    pub invited: AgentPubKey,
    pub timestamp: Duration,
}

entry_def!(Invitation
    EntryDef{
        id: "invitation".into(),
        visibility: EntryVisibility::Public,
        crdt_type: CrdtType,
        required_validations: RequiredValidations::default(),
        required_validation_type: RequiredValidationType::Element
    }
);

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct SendInvitationInput( pub AgentPubKey );



