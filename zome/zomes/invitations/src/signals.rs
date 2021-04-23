use hdk::prelude::*;

use crate::invitation::Invitation;

// Signal Details is a warpper for all the signals we can send from the happ
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct SignalDetails {
    pub name: String,
    pub payload: SignalPayload,
}

// Here we add all the signal_types we add in the future
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub enum SignalPayload {
    InvitationAccepted(Invitation), //THE INVITATION ARE ACCEPTED IF ALL THE INVITEES HAVE ACCEPTED THE INVITATION
    InvitationReceived(EntryHash),
    InvitationStatusUpdated(EntryHash), //THE INVITATION STATUS IS UPDATED EVERYTIME ONE OF THE INVITEES ACCEPTED THE INVITATION,  BUT NOT ALL OF THEM HAVE ACCEPTED YET
    InvitationRejected(Invitation),
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct SignalName;
impl SignalName {
    pub const INVITATION_RECEIVED: &'static str = "invitation received";
    pub const INVITATION_ACCEPTED: &'static str = "invitation accepted";
    pub const INVITATION_UPDATED: &'static str = "invitation updated";
    pub const INVITATION_REJECTED: &'static str = "invitation rejected";
}
