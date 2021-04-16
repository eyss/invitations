use hdk::prelude::*;

use crate::signals::{SignalDetails, SignalName, SignalPayload};

use super::Invitation;

pub fn send_invitation(guest: AgentPubKey) -> ExternResult<()> {
    
    let agent_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey;
    let invitation = Invitation {
        invited: guest.clone(),
        inviter: agent_pub_key.clone(),
        timestamp: sys_time()?,
    };
    let invitation_entry_hash: EntryHash = hash_entry(invitation.clone())?;
    let invitation_header_hash: HeaderHash = create_entry(invitation.clone())?;

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
        payload: SignalPayload::InvitationReceived(invitation_header_hash),
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

    let received_invitations_links: Vec<Link> = get_links(
        agent_pub_key.into(),
        Some(LinkTag::new(String::from("Invited"))),
    )?
    .into_inner();

    get_invitations_entries_from_links(received_invitations_links)
}

pub fn reject_invitation(invitation_header_hash: HeaderHash) -> ExternResult<bool> {

    let invitation: Invitation = get_invitation_entry_from_hash::<HeaderHash>(invitation_header_hash.clone())?;

    delete_entry(invitation_header_hash.clone())?;

    let inviter: AgentPubKey = invitation.clone().inviter; 
    
    let signal: SignalDetails = SignalDetails {
        name: SignalName::INVITATION_REJECTED.to_owned(),
        payload: SignalPayload::InvitationStatusUpdated(invitation_header_hash),
    };

    remote_signal(ExternIO::encode(signal)?, vec![inviter])?;

    Ok(true)
}

pub fn accept_invitation(invitation_header_hash: HeaderHash) -> ExternResult<bool> {

    let invitation: Invitation = get_invitation_entry_from_hash::<HeaderHash>(invitation_header_hash.clone())?;
    
    let inviter: AgentPubKey = invitation.clone().inviter; 
    
    let signal: SignalDetails = SignalDetails {
        name: SignalName::INVITATION_ACCEPTED.to_owned(),
        payload: SignalPayload::InvitationStatusUpdated(invitation_header_hash),
    };

    remote_signal(ExternIO::encode(signal)?, vec![inviter])?;

    Ok(true)
}



//HELPERS
fn get_invitations_entries_from_links(links: Vec<Link>) -> ExternResult<Vec<Invitation>> {
    let mut invitations: Vec<Invitation> = vec![];
    
    for link in links.iter() {

        let invitation:Invitation =  get_invitation_entry_from_hash::<EntryHash>(link.target.clone())?;

        invitations.push(invitation);

    }   
    // for link in links.iter() {
    //     match get(link.target.clone(), GetOptions::content())? {
    //         Some(element) => match element.entry().to_app_option::<Invitation>()? {
    //             Some(invitation) => {
    //                 invitations.push(invitation);
    //             }
    //             None => {}
    //         },

    //         None => {}
    //     };
    // }

    // Ok(invitations)
    Ok(invitations)
}



fn get_invitation_entry_from_hash<H>(input_hash: H)->ExternResult<Invitation> where  AnyDhtHash: From<H>{


    match get(input_hash, GetOptions::content())?{

        Some(element) => match element.entry().to_app_option::<Invitation>()?{

            Some(invitation) =>{
                return Ok(invitation)
            },

            None => {}
        },
        None => {}
    }

    return Err(WasmError::Guest("we dont found the invitation entry for the given header_hash".into()));



    // let element: Element = get(invitation_header_hash.clone(), GetOptions::content())?.ok_or(
    // )?;

    // let invitation:Invitation = element.entry().to_app_option::<Invitation>()?.ok_or(
    //     WasmError::Guest("we dont found the invitation entry for the given header_hash".into())
    // )?;

    // return Ok(invitation);
}

