use hdk::prelude::*;

use crate::signals::{SignalDetails, SignalName, SignalPayload};

use super::Invitation;

pub fn send_invitation(guest: AgentPubKey) -> ExternResult<()> {
    
    let agent_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey;
    let invitation = Invitation {
        invited: guest.clone(),
        inviter: agent_pub_key.clone(),
        status: String::from("Pending"),
        timestamp: sys_time()?,
    };
    let invitation_entry_hash: EntryHash = hash_entry(&invitation)?;
    create_entry(&invitation.clone())?;

    create_link(
        agent_pub_key.into(),
        invitation_entry_hash.clone(),
        LinkTag::new(String::from("Inviter")),
    )?;

    create_link(
        guest.clone().into(),
        invitation_entry_hash.clone(),
        LinkTag::new(String::from("Invited")),
    )?;

    let signal: SignalDetails = SignalDetails {
        name: SignalName::INVITATION_RECEIVED.to_owned(),
        payload: SignalPayload::InvitationReceived(invitation),
    };

    remote_signal(ExternIO::encode(signal)?, vec![guest])?;

    Ok(())
}

pub fn get_sent_invitations() -> ExternResult<Vec<Invitation>> {
    let agent_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey;

    let sended_invitations_links: Vec<Link> = get_links(
        agent_pub_key.into(),
        Some(LinkTag::new(String::from("Inviter"))),
    )?
    .into_inner();

    get_invitations_entries_from_links(sended_invitations_links)
}

pub fn get_received_invitations() -> ExternResult<Vec<Invitation>> {
    let agent_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey;

    let sended_invitations_links: Vec<Link> = get_links(
        agent_pub_key.into(),
        Some(LinkTag::new(String::from("Invited"))),
    )?
    .into_inner();

    get_invitations_entries_from_links(sended_invitations_links)
}

pub fn reject_invitation(invitation: Invitation) -> ExternResult<bool> {

    let invitation_entry_hash: EntryHash = hash_entry(&invitation)?;

    let element: Element = get(invitation_entry_hash, GetOptions::content())?.ok_or(
        WasmError::Guest("we dont found the invitation entry you give us".into()),
    )?;

    let invitation_header_hash: HeaderHash = element.header_address().to_owned();
    let updated_invitation: Invitation = Invitation {
        status: String::from("rejected"),
        ..invitation
    };

    update_entry(invitation_header_hash, updated_invitation.clone())?;

    let inviter: AgentPubKey = updated_invitation.clone().inviter;

    let signal: SignalDetails = SignalDetails {
        name: SignalName::INVITATION_REJECTED.to_owned(),
        payload: SignalPayload::InvitationStatusUpdated(updated_invitation),
    };

    remote_signal(ExternIO::encode(signal)?, vec![inviter])?;
    
    // match get(invitation_entry_hash, GetOptions::content())? {
    //     Some(element) => {
    //         let invitation_header_hash: HeaderHash = element.header_address().to_owned();
    //         let updated_invitation: Invitation = Invitation {
    //             status: String::from("rejected"),
    //             ..invitation
    //         };

    //         update_entry(invitation_header_hash, updated_invitation.clone())?;

    //         let inviter: AgentPubKey = updated_invitation.clone().inviter;

    //         let signal: SignalDetails = SignalDetails {
    //             name: SignalName::INVITATION_REJECTED.to_owned(),
    //             payload: SignalPayload::InvitationStatusUpdated(updated_invitation),
    //         };

    //         remote_signal(ExternIO::encode(signal)?, vec![inviter])?;
    //     }

    //     None => {
    //         error("we dont found the invitation entry you give us")?;
    //     }
    // }

    Ok(true)
}

pub fn accept_invitation(invitation: Invitation) -> ExternResult<bool> {

    let invitation_entry_hash: EntryHash = hash_entry(&invitation)?;

    let element: Element = get(invitation_entry_hash, GetOptions::content())?.ok_or(
        WasmError::Guest("we dont found the invitation entry you give us".into()),
    )?;

    let invitation_header_hash: HeaderHash = element.header_address().to_owned();
    let updated_invitation: Invitation = Invitation {
        status: String::from("acepted"),
        ..invitation.clone()
    };

    update_entry(invitation_header_hash, updated_invitation.clone())?;

    let inviter: AgentPubKey = updated_invitation.clone().inviter;

    let signal: SignalDetails = SignalDetails {
        name: SignalName::INVITATION_ACCEPTED.to_owned(),
        payload: SignalPayload::InvitationStatusUpdated(updated_invitation)
    };

    remote_signal(
        ExternIO::encode(signal)?,
        vec![inviter]
    )?;


    // match get(invitation_entry_hash, GetOptions::content())? {
    //     Some(element) => {
    //         let invitation_header_hash: HeaderHash = element.header_address().to_owned();
    //         let updated_invitation: Invitation = Invitation {
    //             status: String::from("acepted"),
    //             ..invitation.clone()
    //         };
    //         let _agent_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey;
    //         update_entry(invitation_header_hash, updated_invitation.clone())?;

    //         let inviter: AgentPubKey = updated_invitation.clone().inviter;

    //         let signal: SignalDetails = SignalDetails {
    //             name: SignalName::INVITATION_ACCEPTED.to_owned(),
    //             payload: SignalPayload::InvitationStatusUpdated(updated_invitation)
    //         };

    //         remote_signal(
    //             ExternIO::encode(signal)?,
    //             vec![inviter]
    //         )?;
    //     }

    //     None => {
    //         error("we dont found the invitation entry you give us")?;
    //     }

    // }

    Ok(true)
}

//HELPERS
fn get_invitations_entries_from_links(links: Vec<Link>) -> ExternResult<Vec<Invitation>> {
    let mut invitations: Vec<Invitation> = vec![];

    for link in links.iter() {
        match get(link.target.clone(), GetOptions::content())? {
            Some(element) => match element.entry().to_app_option::<Invitation>()? {
                Some(invitation) => {
                    invitations.push(invitation);
                }
                None => {}
            },

            None => {}
        };
    }

    Ok(invitations)
}
