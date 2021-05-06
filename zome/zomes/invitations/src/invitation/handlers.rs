use hdk::prelude::*;

use crate::signals::{SignalDetails, SignalName, SignalPayload};

use super::{Invitation, InvitationEntryInfo, InviteesList};

pub fn send_invitation(invitees_list: InviteesList) -> ExternResult<()> {
    let agent_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey;
    let mut invited_agents: Vec<AgentPubKey> = invitees_list.0.clone();
    
    invited_agents.push(agent_pub_key.clone());

    let invitation = Invitation {
        invitees: invitees_list.0.clone(),
        inviter: agent_pub_key.clone(),
        timestamp: sys_time()?,
    };

    let invitation_entry_hash: EntryHash = hash_entry(invitation.clone())?;
    create_entry(invitation.clone())?;

    for agent in invited_agents.into_iter() {
        create_link(
            agent.into(),
            invitation_entry_hash.clone(),
            LinkTag::new(String::from("Invitee")),
        )?;
    }

    let signal: SignalDetails = SignalDetails {
        name: SignalName::INVITATION_RECEIVED.to_owned(),
        payload: SignalPayload::InvitationReceived(invitation_entry_hash),
    };

    remote_signal(ExternIO::encode(signal)?, invitees_list.0)?;
    return Ok(());
}

pub fn get_my_pending_invitations() -> ExternResult<Vec<InvitationEntryInfo>> {
    let agent_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey;
    let mut pending_invitations: Vec<InvitationEntryInfo> = vec![];

    let pending_invitations_links: Vec<Link> = get_links(
        agent_pub_key.into(),
        Some(LinkTag::new(String::from("Invitee"))),
    )?
    .into_inner();

    for link in pending_invitations_links.into_iter() {
        pending_invitations.push(get_invitations_entry_info(link.target)?);
    }

    return Ok(pending_invitations);
}

pub fn reject_invitation(invitation_entry_hash: EntryHash) -> ExternResult<bool> {
    // let invitation_entry_info: InvitationEntryInfo = get_invitation_entry_info::<HeaderHash>(invitation_header_hash.clone())?;

    let my_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey.into();

    let my_pending_invitations_links = get_links(
        my_pub_key.clone().into(),
        Some(LinkTag::new(String::from("Invitee"))),
    )?
    .into_inner();

    let invitation_link_to_reject: Vec<Link> = my_pending_invitations_links
        .into_iter()
        .filter(|link| {
            if link.target == invitation_entry_hash.clone() {
                return true;
            }
            return false;
        })
        .collect::<Vec<Link>>();

    //DELETE MI LINK TO THE INVITATION I WANT TO REJECT
    for invitation_link in invitation_link_to_reject.into_iter() {
        delete_link(invitation_link.create_link_hash)?;
    }

    //MARK THE INVITATION ENTRY AS DELETED


    // match get(invitation_entry_hash.clone(), GetOptions::content())? {

    //     Some(invitation_entry_element)=>{
    //         delete_entry(invitation_entry_element.header_address().to_owned())?;
    //     },

    //     None => {}
    // }

    // let invitation_entry_element: Element =
    //     get(invitation_entry_hash.clone(), GetOptions::content())?.ok_or_else(|| {
    //         WasmError::Guest("we dont found the invitation entry for the given hash".into())
    //     })?;

    // delete_entry(invitation_entry_element.header_address().to_owned())?; // this is creating bugs 

    // NOTIFY ALL THE INVITEES

    // let invitation_entry_invitees: Vec<AgentPubKey> = invitation_entry_element
    //     .entry()
    //     .to_app_option::<Invitation>()?
    //     .ok_or_else(|| {
    //         WasmError::Guest("we dont found the invitation entry for the given element".into())
    //     })?
    //     .invitees
    //     .into_iter()
    //     .filter(|invitee| {
    //         if invitee.to_owned() != my_pub_key.clone() {
    //             return true;
    //         }
    //         return false;
    //     })
    //     .collect();

    // NOTIFY ALL THE INVITEES

    create_link(
        invitation_entry_hash.clone(),
        agent_info()?.agent_latest_pubkey.into(),
        LinkTag::new(String::from("Rejected")),
    )?;
    
    
    // NOTIFY ALL THE INVITEES (except for those who rejected this invitation before)
    
    let invitation_entry_info: InvitationEntryInfo = get_invitations_entry_info(invitation_entry_hash.clone())?;

    let send_signal_to: Vec<AgentPubKey> = 
        invitation_entry_info.
        invitation.
        invitees.clone().
        into_iter().
        filter(|invitee|{

            !invitation_entry_info.clone().invitees_who_rejected.contains(&invitee)

        }).
        collect();


    let signal: SignalDetails = SignalDetails {
        name: SignalName::INVITATION_REJECTED.to_owned(),
        payload: SignalPayload::InvitationRejected(invitation_entry_hash),
    };

    remote_signal(ExternIO::encode(signal)?, send_signal_to)?;

    Ok(true)
}

pub fn accept_invitation(invitation_entry_hash: EntryHash) -> ExternResult<bool> {
    // # WE WILL HANDLE THE INVITATION ACCEPTING PROCESS A BIT DIFERENCE DEPENDING IF THE INVITATION HAVE ONE OR SEVERAL INVITEES
    // #1 WE GET THE INVITATION ENTRY
    let invitation_entry_info: InvitationEntryInfo =
        get_invitations_entry_info(invitation_entry_hash.clone())?;

    // we will check if the agent attempting to accept this invitation is an invitee
    if invitation_entry_info
        .invitation
        .invitees
        .contains(&agent_info()?.agent_latest_pubkey)
    {
        create_link(
            invitation_entry_hash.clone(),
            agent_info()?.agent_latest_pubkey.into(),
            LinkTag::new(String::from("Accepted")),
        )?;
        let signal: SignalDetails = SignalDetails {
            name: SignalName::INVITATION_ACCEPTED.to_owned(),
            payload: SignalPayload::InvitationAccepted(invitation_entry_info.invitation.clone()),
        };
        remote_signal(
            ExternIO::encode(signal)?,
            invitation_entry_info.invitation.invitees,
        )?;
        return Ok(true);
    }

    Ok(false)
}

pub fn _clear_invitation(invitation_entry_hash: EntryHash) -> ExternResult<bool> {
    
    let _ = get_links(
        agent_info()?.agent_latest_pubkey.into(),
        Some(LinkTag::new("Invitee")),
    )?
    .into_inner()
    .into_iter()
    .filter(|link| link.target == invitation_entry_hash.clone())
    .map(|link_to_invitation| -> ExternResult<()> {
        delete_entry(link_to_invitation.create_link_hash)?;
        Ok(())
    });

    return Ok(true);
}

//HELPERS
fn get_invitations_entry_info(
    invitation_entry_hash: EntryHash,
) -> ExternResult<InvitationEntryInfo> {

    let invitation_entry_element: Element =
        get(invitation_entry_hash.clone(), GetOptions::content())?
            .ok_or_else(|| WasmError::Guest("we dont found the given hash ".into()))?;

    let invitation_header_hash: HeaderHash = invitation_entry_element.clone().header_address().to_owned();

    let invitation_entry: Invitation = invitation_entry_element
        .clone()
        .entry()
        .to_app_option()?
        .ok_or_else(|| WasmError::Guest("we dont found the given hash".into()))?;

    //GET LINKS ON THE ENTRY HASH TO KNOWN WICH INVITEES HAVE ALREADY ACCEPTED THIS INVITATION

    //INVITEES WHO ACCEPTED

    let invitees_who_accepted: Vec<AgentPubKey> = get_links(
        invitation_entry_hash.clone(),
        Some(LinkTag::new("Accepted")),
    )?
    .into_inner()
    .into_iter()
    .map(|link| -> AgentPubKey {
        return link.target.into();
    })
    .collect();

    //INVITEES WHO REJECTED

    let invitees_who_rejected: Vec<AgentPubKey> = get_links(
        invitation_entry_hash.clone(),
        Some(LinkTag::new("Rejected")),
    )?
    .into_inner()
    .into_iter()
    .map(|link| -> AgentPubKey {
        return link.target.into();
    })
    .collect();

    return Ok(InvitationEntryInfo {
        invitation: invitation_entry,
        invitation_entry_hash,
        invitation_header_hash,
        invitees_who_accepted,
        invitees_who_rejected,
    });
}


//new
// fn get_invitations_entry_info(
//     invitation_entry_hash: EntryHash,
// ) -> ExternResult<InvitationEntryInfo> {
//     let invitation_entry_element: Element =
//         get(invitation_entry_hash.clone(), GetOptions::content())?
//             .ok_or_else(|| WasmError::Guest("we dont found the given hash Hola ".into()))?;

//     let invitation_header_hash: HeaderHash =
//         invitation_entry_element.clone().header_address().to_owned();

//     let invitation_entry: Invitation = invitation_entry_element
//         .clone()
//         .entry()
//         .to_app_option()?
//         .ok_or_else(|| WasmError::Guest("we dont found the given hash".into()))?;

//     //GET LINKS ON THE ENTRY HASH TO KNOWN WICH INVITEES HAVE ALREADY ACCEPTED THIS INVITATION

//     let invitees_who_accepted: Vec<AgentPubKey> = get_links(
//         invitation_entry_hash.clone(),
//         Some(LinkTag::new("Accepted")),
//     )?
//     .into_inner()
//     .into_iter()
//     .map(|link| -> AgentPubKey {
//         return link.target.into();
//     })
//     .collect();


    

//     let invitation_entry_details =
//         get_details::<HeaderHash>(invitation_header_hash.clone(), GetOptions::content())?
//             .ok_or_else(|| {
//                 WasmError::Guest("we dont found the details for the  given hash".into())
//             })?;

//     match invitation_entry_details {
//         Details::Element(element_details) => {
//             let invitees_who_rejected: Vec<AgentPubKey> = element_details
//                 .deletes
//                 .into_iter()
//                 .map(
//                     |delete_signed_header_hashed: SignedHeaderHashed| -> AgentPubKey {
//                         let header_author: AgentPubKey =
//                             delete_signed_header_hashed.header().author().to_owned();
//                         return header_author;
//                     },
//                 )
//                 .collect();

//             return Ok(InvitationEntryInfo {
//                 invitation: invitation_entry,
//                 invitation_entry_hash,
//                 invitation_header_hash,
//                 invitees_who_accepted,
//                 invitees_who_rejected,
//             });
//         }
//         _ => {}
//     }

//     return Err(WasmError::Guest(
//         "we dont found the invitation info for this hash ".into(),
//     ));
// }


//old

// fn get_invitation_entry_info<H>(input_hash: H) -> ExternResult<InvitationEntryInfo>
// where
//     AnyDhtHash: From<H>,
// {
//     match get(input_hash, GetOptions::content())? {
//         Some(element) => match element.entry().to_app_option::<Invitation>()? {
//             Some(invitation) => {
//                 return Ok(InvitationEntryInfo {
//                     invitation: invitation.clone(),
//                     invitation_entry_hash: hash_entry(invitation)?,
//                     invitation_header_hash: element.header_address().to_owned(),
//                 });
//             }
//             None => {}
//         },
//         None => {}
//     }

//     return Err(WasmError::Guest(
//         "we dont found the invitation entry for the given hash".into(),
//     ));
// }

//clear invitation method should be added (Header), eliminar mi link hacia la entry (cuando le dan a la X)

// fn delete_invitation_entry(invitation_entry_info: InvitationEntryInfo) -> ExternResult<()> {
//     let invitation: Invitation = invitation_entry_info.invitation;
//     let invitation_entry_hash: EntryHash = invitation_entry_info.invitation_entry_hash;
//     let invitation_header_hash: HeaderHash = invitation_entry_info.invitation_header_hash;

//     for link in get_links(invitation_entry_hash.clone(), None)?
//         .into_inner()
//         .into_iter()
//     {
//         delete_link(link.create_link_hash)?;
//     }

//     for invitee in invitation.clone().invitees.into_iter() {
//         let invitee_links: Vec<Link> = get_links(
//             invitee.clone().into(),
//             Some(LinkTag::new(String::from("Invited"))),
//         )?
//         .into_inner();

//         for link in invitee_links.into_iter() {
//             if link.target == invitation_entry_hash {
//                 delete_link(link.create_link_hash)?;
//             }
//         }
//     }

//     let inviter_links: Vec<Link> = get_links(
//         invitation.inviter.clone().into(),
//         Some(LinkTag::new(String::from("Inviter"))),
//     )?
//     .into_inner();

//     for link in inviter_links.into_iter() {
//         if link.target == invitation_entry_hash {
//             delete_link(link.create_link_hash)?;
//         }
//     }

//     delete_entry(invitation_header_hash)?;

//     Ok(())
// }
