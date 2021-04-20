use hdk::prelude::*;
use std::time::Duration;

pub mod handlers;

#[derive(Clone, Debug, Serialize, Deserialize, SerializedBytes)]
pub struct Invitation {
    pub inviter: AgentPubKey,
    pub invitees: Vec<AgentPubKey>,
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


#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct InviteesList(pub Vec<AgentPubKey>);

//this struct wiil be used as an output value an will contain helpfull information for the ui 
#[derive(Clone, Debug, Serialize, Deserialize, SerializedBytes)]
pub struct InvitationEntryInfo {
    pub invitation:Invitation,
    pub invitation_entry_hash: EntryHash,
    pub invitation_header_hash:HeaderHash
}







