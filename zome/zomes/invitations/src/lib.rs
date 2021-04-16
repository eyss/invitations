use hdk::prelude::*;

mod signals;
mod invitation;

use invitation::handlers;

use invitation::{
    Invitation,
    // SendInvitationInput
};

use signals::{
    SignalDetails
};

entry_defs![
    Invitation::entry_def()  
];

#[hdk_extern]
pub fn init(_: ()) -> ExternResult<InitCallbackResult> {
    let mut fuctions = HashSet::new();

    let tag: String = "recv_remote_signal_cap_grant".into();
    let access: CapAccess = CapAccess::Unrestricted;

    let zome_name: ZomeName = zome_info()?.zome_name;
    let function_name: FunctionName = FunctionName("recv_remote_signal".into());

    fuctions.insert((zome_name, function_name));

    let cap_grant_entry: CapGrantEntry = CapGrantEntry::new(
        tag,    // A string by which to later query for saved grants.
        access, // Unrestricted access means any external agent can call the extern
        fuctions,
    );

    create_cap_grant(cap_grant_entry)?;
    Ok(InitCallbackResult::Pass)
}

#[hdk_extern]
fn recv_remote_signal(signal: ExternIO) -> ExternResult<()> {
    let signal_detail: SignalDetails = signal.decode()?;
    emit_signal(&signal_detail)?;
    Ok(())
}

#[hdk_extern]
fn send_invitation(input:AgentPubKey)->ExternResult<()>{
    return handlers::send_invitation(input);
}

#[hdk_extern]
fn get_sent_invitations(_:()) -> ExternResult<Vec<Invitation>> {
    return handlers::get_sent_invitations();
}

#[hdk_extern]
fn get_received_invitations(_:()) -> ExternResult<Vec<Invitation>> {
    return handlers::get_received_invitations();
}

#[hdk_extern]
fn accept_invitation(invitation_header_hash: HeaderHash) -> ExternResult<bool> {
    return handlers::accept_invitation(invitation_header_hash);
}

#[hdk_extern]
fn reject_invitation(invitation_header_hash: HeaderHash) -> ExternResult<bool> {
    return handlers::reject_invitation(invitation_header_hash);
}



