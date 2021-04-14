use hdk::prelude::*;

mod signals;
mod invitation;

use invitation::handlers;

use invitation::{
    Invitation,
    SendInvitationInput
};

use signals::{
    SignalDetails
};

entry_defs![
    Invitation::entry_def()  
];

#[hdk_extern]
fn recv_remote_signal(signal: ExternIO) -> ExternResult<()> {
    let signal_detail: SignalDetails = signal.decode()?;
    emit_signal(&signal_detail)?;
    Ok(())
}

#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    Ok(InitCallbackResult::Pass)
}

#[hdk_extern]
fn send_invitation(input:SendInvitationInput)->ExternResult<()>{
    return handlers::send_invitation(input.0);
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
fn accept_invitation(invitation: Invitation) -> ExternResult<bool> {
    return handlers::accept_invitation(invitation);
}
#[hdk_extern]
fn reject_invitation(invitation: Invitation) -> ExternResult<bool> {
    return handlers::reject_invitation(invitation);
}



