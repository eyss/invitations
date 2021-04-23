use hdk::prelude::*;

mod invitation;
mod signals;

use invitation::handlers;

use invitation::{
    Invitation,
    InvitationEntryInfo, 
    InviteesList,
};

use signals::SignalDetails;

entry_defs![Invitation::entry_def()];

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
fn send_invitation(invitees_list: InviteesList) -> ExternResult<()> {
    return handlers::send_invitation(invitees_list);
}

#[hdk_extern]
fn get_my_pending_invitations(_: ()) -> ExternResult<Vec<InvitationEntryInfo>> {
    return handlers::get_my_pending_invitations();
}

#[hdk_extern]
fn accept_invitation(invitation_entry_hash: EntryHash) -> ExternResult<bool> {
    return handlers::accept_invitation(invitation_entry_hash);
}

#[hdk_extern]
fn reject_invitation(invitation_entry_hash: EntryHash) -> ExternResult<bool> {
    return handlers::reject_invitation(invitation_entry_hash);
}


