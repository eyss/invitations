use hdk::prelude::*;
use hdk::prelude::ElementEntry::Present;

use hc_utils::{
    WrappedHeaderHash,
    WrappedEntryHash,
    WrappedAgentPubKey
};


use crate::signals::{SignalDetails, SignalName, SignalPayload};

use super::{Invitation, InvitationEntryInfo, InviteesList};

pub fn send_invitation(invitees_list: InviteesList) -> ExternResult<()> {
    
    let agent_pub_key: AgentPubKey= agent_info()?.agent_latest_pubkey;

    let invited_agents: Vec<WrappedAgentPubKey> = invitees_list.0.clone().into_iter().map(|agent_pub_key|->WrappedAgentPubKey{
        return WrappedAgentPubKey(agent_pub_key);
    })
    .collect();

    let invitation = Invitation {
        invitees: invited_agents,
        inviter: WrappedAgentPubKey(agent_pub_key.clone()),
        timestamp: sys_time()?,
    };

    let invitation_entry_hash: EntryHash = hash_entry(invitation.clone())?;
    let invitation_header_hash:HeaderHash = create_entry(invitation.clone())?;

    create_link(
        agent_pub_key.into(),
        invitation_entry_hash.clone(),
        LinkTag::new(String::from("Invitee")),
    )?;

    for agent in invitees_list.0.clone().into_iter() {
        create_link(
            agent.into(),
            invitation_entry_hash.clone(),
            LinkTag::new(String::from("Invitee")),
        )?;
    }

    let signal: SignalDetails = SignalDetails {
        name: SignalName::INVITATION_RECEIVED.to_owned(),
        payload: SignalPayload::InvitationReceived(InvitationEntryInfo {
            invitation,
            invitation_entry_hash: WrappedEntryHash(invitation_entry_hash),
            invitation_header_hash: WrappedHeaderHash(invitation_header_hash),
            invitees_who_accepted: vec![],
            invitees_who_rejected: vec![],
        }),
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

    // DELETE MI LINK TO THE INVITATION I WANT TO REJECT
    for invitation_link in invitation_link_to_reject.into_iter() {
        delete_link(invitation_link.create_link_hash)?;
    }

    // MARK THE INVITATION ENTRY AS DELETED

    let invitation_entry_info:InvitationEntryInfo = get_invitations_entry_info(invitation_entry_hash.clone())?;
    delete_entry(invitation_entry_info.clone().invitation_header_hash.0)?;

    // NOTIFY ALL THE INVITEES (except for those who rejected this invitation before)

    let send_signal_to: Vec<AgentPubKey> = invitation_entry_info
        .invitation
        .invitees
        .clone()
        .into_iter()
        .filter(|invitee| {
            !invitation_entry_info
                .clone()
                .invitees_who_rejected
                .contains(&invitee)
        })
        .map(|wrapped_agent_pub_key|->AgentPubKey{
            return wrapped_agent_pub_key.0;
        })
        .collect();

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
        .contains(& WrappedAgentPubKey(agent_info()?.agent_latest_pubkey))
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

        let send_signal_to: Vec<AgentPubKey>  = 
            invitation_entry_info.invitation.invitees.into_iter().map(|wrapped_agent_pub_key|->AgentPubKey{
                return wrapped_agent_pub_key.0;
            })
            .collect();

        remote_signal(
            ExternIO::encode(signal)?,
            send_signal_to,
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
fn get_invitations_entry_info(invitation_entry_hash: EntryHash) -> ExternResult<InvitationEntryInfo> {
    let invitation_entry_details =
        get_details::<EntryHash>(invitation_entry_hash.clone(), GetOptions::content())?
            .ok_or_else(|| {
                WasmError::Guest("we dont found the details for the  given hash".into())
            })?;

    match invitation_entry_details {
        Details::Entry(invitation_entry_details) => {
            let element_entry =
                ElementEntry::from(Present(invitation_entry_details.clone().entry));

            let invitation: Invitation = element_entry
                .to_app_option()?
                .ok_or_else(|| WasmError::Guest("we dont found the invitation entry for the given hash".into()))?;

            let invitation_header_hash:HeaderHash = invitation_entry_details.clone().headers[0].header_address().to_owned();    

            let invitees_who_accepted: Vec<WrappedAgentPubKey> = get_links(
                invitation_entry_hash.clone(),
                Some(LinkTag::new("Accepted")),
            )?
            .into_inner()
            .into_iter()
            .map(|link| -> WrappedAgentPubKey {
                return WrappedAgentPubKey(link.target.into());
            })
            .collect();

            let invitees_who_rejected: Vec<WrappedAgentPubKey> = invitation_entry_details.deletes
            .into_iter()
            .map(|signed_header_hashed|->WrappedAgentPubKey {
                return WrappedAgentPubKey(signed_header_hashed.header().author().to_owned());
            })
            .collect();

            return Ok(InvitationEntryInfo{
                invitation,
                invitation_entry_hash: WrappedEntryHash(invitation_entry_hash),
                invitation_header_hash: WrappedHeaderHash(invitation_header_hash),
                invitees_who_accepted,
                invitees_who_rejected
            });
        }

        Details::Element(_) => {}
    }

    return Err(WasmError::Guest(
        "we dont the entry details for the given hash".into(),
    ));
}
























// fn get_invitations_entry_info(
//     invitation_entry_hash: EntryHash,
// ) -> ExternResult<InvitationEntryInfo> {
//     let invitation_entry_element: Element =
//         get(invitation_entry_hash.clone(), GetOptions::content())?
//             .ok_or_else(|| WasmError::Guest("we dont found the given hash ".into()))?;

//     let invitation_header_hash: HeaderHash =
//         invitation_entry_element.clone().header_address().to_owned();

//     let invitation_entry: Invitation = invitation_entry_element
//         .clone()
//         .entry()
//         .to_app_option()?
//         .ok_or_else(|| WasmError::Guest("we dont found the given hash".into()))?;

//     //GET LINKS ON THE ENTRY HASH TO KNOWN WICH INVITEES HAVE ALREADY ACCEPTED THIS INVITATION

//     //INVITEES WHO ACCEPTED

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

//     //INVITEES WHO REJECTED

//     let invitees_who_rejected: Vec<AgentPubKey> = get_links(
//         invitation_entry_hash.clone(),
//         Some(LinkTag::new("Rejected")),
//     )?
//     .into_inner()
//     .into_iter()
//     .map(|link| -> AgentPubKey {
//         return link.target.into();
//     })
//     .collect();

//     return Ok(InvitationEntryInfo {
//         invitation: invitation_entry,
//         invitation_entry_hash,
//         invitation_header_hash,
//         invitees_who_accepted,
//         invitees_who_rejected,
//     });
// }

//GET LINKS ON THE ENTRY HASH TO KNOWN WICH INVITEES HAVE ALREADY ACCEPTED THIS INVITATION

// let invitees_who_accepted: Vec<AgentPubKey> = get_links(
//     invitation_entry_hash.clone(),
//     Some(LinkTag::new("Accepted")),
// )?
// .into_inner()
// .into_iter()
// .map(|link| -> AgentPubKey {
//     return link.target.into();
// })
// .collect();
