use chrono::{DateTime, NaiveDateTime, Utc};
use hdk::prelude::ElementEntry::Present;
use hdk::prelude::*;

use hdk::prelude::holo_hash::{AgentPubKeyB64, EntryHashB64, HeaderHashB64};

use crate::signals::{SignalDetails, SignalName, SignalPayload};

use super::{Invitation, InvitationEntryInfo, InviteesList};

#[hdk_extern(infallible)]
fn post_commit(headers: Vec<SignedHeaderHashed>) {

    let invitation_entry_type = EntryType::App(AppEntryType::new(
        entry_def_index!(Invitation).unwrap(),
        zome_info().unwrap().id,
        EntryVisibility::Public,
    ));
    let filter = ChainQueryFilter::new()
        .entry_type(invitation_entry_type)
        .include_entries(true);
    let elements = query(filter).unwrap();

    let header_hashes: Vec<HeaderHash> = headers
        .into_iter()
        .map(|shh| shh.header_address().clone())
        .collect();

    let new_invitation_elements: Vec<Element> = elements
        .into_iter()
        .filter(|el| header_hashes.contains(el.header_address()))
        .collect();

    for el in new_invitation_elements.into_iter() {
        let (_, inv) = element_to_invitation(el.clone()).unwrap();
        let invitation_header_hash = el.signed_header().as_hash(); //.entry().hash.entry_hash().unwrap();
        let invitation_entry_hash = el.header().entry_hash().unwrap();

        let signal: SignalDetails = SignalDetails {
            name: SignalName::INVITATION_RECEIVED.to_owned(),
            payload: SignalPayload::InvitationReceived(InvitationEntryInfo {
                invitation: inv.clone(),
                invitation_entry_hash: EntryHashB64::from(invitation_entry_hash.clone()),
                invitation_header_hash: HeaderHashB64::from(invitation_header_hash.clone()),
                invitees_who_accepted: vec![],
                invitees_who_rejected: vec![],
            }),
        };
        let invitees = inv.invitees
        .into_iter()
        .map(|invitee| {
            HoloHash::from(invitee.clone())
        }).collect();
       

        let result = remote_signal(ExternIO::encode(signal).unwrap(), invitees);
        if let Err(err) = result {
            error!("Error executing remote_signal in post_commit function: {:?}", err);
        };
    }
}

pub fn send_invitation(invitees_list: InviteesList) -> ExternResult<()> {
    let agent_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey;

    let invited_agents: Vec<AgentPubKeyB64> = invitees_list
        .0
        .clone()
        .into_iter()
        .map(|agent_pub_key| AgentPubKeyB64::from(agent_pub_key))
        .collect();

    let now = sys_time()?.as_seconds_and_nanos();

    let date_time = DateTime::from_utc(NaiveDateTime::from_timestamp(now.0, now.1), Utc);

    let invitation = Invitation {
        invitees: invited_agents,
        inviter: AgentPubKeyB64::from(agent_pub_key.clone()),
        timestamp: date_time,
    };

    let invitation_entry_hash: EntryHash = hash_entry(invitation.clone())?;
    create_entry(invitation.clone())?;

    create_link(
        agent_pub_key.into(),
        invitation_entry_hash.clone(),
        LinkType(0),
        LinkTag::new(String::from("Invitee")),
    )?;

    for agent in invitees_list.0.clone().into_iter() {
        create_link(
            agent.into(),
            invitation_entry_hash.clone(),
            LinkType(0),
            LinkTag::new(String::from("Invitee")),
        )?;
    }
    return Ok(());
}

pub fn get_my_pending_invitations() -> ExternResult<Vec<InvitationEntryInfo>> {
    let agent_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey;
    let mut pending_invitations: Vec<InvitationEntryInfo> = vec![];

    let pending_invitations_links: Vec<Link> = get_links(
        agent_pub_key.into(),
        Some(LinkTag::new(String::from("Invitee"))),
    )?;

    let get_input = pending_invitations_links
        .into_iter()
        .map(|link| GetInput::new(link.target.into(), GetOptions::default()))
        .collect();

    let get_output = HDK.with(|h| h.borrow().get_details(get_input))?;

    for details in get_output.into_iter().filter_map(|details| details) {
        if let Ok(invitation_info) = get_invitations_entry_info_from_details(details) {
            pending_invitations.push(invitation_info);
        }
    }

    return Ok(pending_invitations);
}

pub fn reject_invitation(invitation_entry_hash: EntryHash) -> ExternResult<bool> {
    let my_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey.into();

    let my_pending_invitations_links = get_links(
        my_pub_key.clone().into(),
        Some(LinkTag::new(String::from("Invitee"))),
    )?;

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

    let mut invitation_entry_info: InvitationEntryInfo =
        get_invitations_entry_info(invitation_entry_hash.clone())?;
    let  variable: HeaderHash = invitation_entry_info.clone().invitation_header_hash.into();
    delete_entry(variable)?;

    // NOTIFY ALL THE INVITEES (except for those who rejected this invitation before and myself)

    let my_pub_key = agent_info()?.agent_initial_pubkey;

    let mut send_signal_to: Vec<AgentPubKey> = invitation_entry_info
        .invitation
        .invitees
        .clone()
        .into_iter()
        .filter(|invitee| {
            !invitation_entry_info
                .clone()
                .invitees_who_rejected
                .contains(&invitee)
                && !AgentPubKey::from(invitee.clone()).eq(&my_pub_key)
        })
        .map(|wrapped_agent_pub_key| wrapped_agent_pub_key.into())
        .collect();

    send_signal_to.push(invitation_entry_info.clone().invitation.inviter.into());

    invitation_entry_info
        .invitees_who_rejected
        .push(AgentPubKeyB64::from(my_pub_key));

    let signal: SignalDetails = SignalDetails {
        name: SignalName::INVITATION_REJECTED.to_owned(),
        payload: SignalPayload::InvitationRejected(invitation_entry_info.clone()),
    };

    remote_signal(ExternIO::encode(signal)?, send_signal_to)?;

    Ok(true)
}

pub fn accept_invitation(invitation_entry_hash: EntryHash) -> ExternResult<bool> {
    // # WE WILL HANDLE THE INVITATION ACCEPTING PROCESS A BIT DIFERENCE DEPENDING IF THE INVITATION HAVE ONE OR SEVERAL INVITEES
    // #1 WE GET THE INVITATION ENTRY

    let my_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey;

    let mut invitation_entry_info: InvitationEntryInfo =
        get_invitations_entry_info(invitation_entry_hash.clone())?;

    // we will check if the agent attempting to accept this invitation is an invitee
    if invitation_entry_info
        .invitation
        .invitees
        .contains(&AgentPubKeyB64::from(my_pub_key.clone()))
    {
        create_link(
            invitation_entry_hash.clone(),
            agent_info()?.agent_latest_pubkey.into(),
            LinkType(0),
            LinkTag::new(String::from("Accepted")),
        )?;

        invitation_entry_info
            .invitees_who_accepted
            .push(AgentPubKeyB64::from(my_pub_key.clone()));

        let signal: SignalDetails = SignalDetails {
            name: SignalName::INVITATION_ACCEPTED.to_owned(),
            payload: SignalPayload::InvitationAccepted(invitation_entry_info.clone()),
        };

        let mut send_signal_to: Vec<AgentPubKey> = invitation_entry_info
            .clone()
            .invitation
            .invitees
            .into_iter()
            .filter(|invitee| !AgentPubKey::from(invitee.clone()).eq(&my_pub_key))
            .map(|wrapped_agent_pub_key| wrapped_agent_pub_key.into())
            .collect();

        send_signal_to.push(invitation_entry_info.clone().invitation.inviter.into());

        remote_signal(ExternIO::encode(signal)?, send_signal_to)?;
        return Ok(true);
    }

    Ok(false)
}

pub fn clear_invitation(invitation_entry_hash: EntryHash) -> ExternResult<bool> {
    let links = get_links(
        agent_info()?.agent_latest_pubkey.into(),
        Some(LinkTag::new("Invitee")),
    )?;

    links
        .into_iter()
        .filter(|link| link.target == invitation_entry_hash.clone())
        .map(|link_to_invitation| -> ExternResult<()> {
            delete_link(link_to_invitation.create_link_hash)?;
            Ok(())
        })
        .collect::<ExternResult<Vec<()>>>()?;

    return Ok(true);
}

//HELPERS
fn get_invitations_entry_info(
    invitation_entry_hash: EntryHash,
) -> ExternResult<InvitationEntryInfo> {
    let invitation_entry_details =
        get_details::<EntryHash>(invitation_entry_hash.clone(), GetOptions::content())?
            .ok_or_else(|| {
                WasmError::Guest("we dont found the details for the  given hash".into())
            })?;

    return get_invitations_entry_info_from_details(invitation_entry_details);
}

//HELPERS
fn get_invitations_entry_info_from_details(
    invitation_entry_details: Details,
) -> ExternResult<InvitationEntryInfo> {
    match invitation_entry_details {
        Details::Entry(invitation_entry_details) => {
            let element_entry = ElementEntry::from(Present(invitation_entry_details.clone().entry));

            let invitation: Invitation = element_entry.to_app_option()?.ok_or_else(|| {
                WasmError::Guest("we dont found the invitation entry for the given hash".into())
            })?;

            let header = invitation_entry_details.clone().headers[0].clone();

            let invitation_header_hash: HeaderHash = header.header_address().to_owned();

            let invitation_entry_hash = header
                .header()
                .entry_hash()
                .ok_or(WasmError::Guest(String::from("Invalid header")))?;
            let invitees_who_accepted: Vec<AgentPubKeyB64> = get_links(
                invitation_entry_hash.clone(),
                Some(LinkTag::new("Accepted")),
            )?
            .into_iter()
            .map(|link| -> AgentPubKeyB64 {
                let agent_pub_key: AgentPubKey = link.target.into();
                return AgentPubKeyB64::from(agent_pub_key);
            })
            .collect();

            let invitees_who_rejected: Vec<AgentPubKeyB64> = invitation_entry_details
                .deletes
                .into_iter()
                .map(|signed_header_hashed| -> AgentPubKeyB64 {
                    return AgentPubKeyB64::from(signed_header_hashed.header().author().to_owned());
                })
                .collect();

            return Ok(InvitationEntryInfo {
                invitation,
                invitation_entry_hash: EntryHashB64::from(invitation_entry_hash.clone()),
                invitation_header_hash: HeaderHashB64::from(invitation_header_hash),
                invitees_who_accepted,
                invitees_who_rejected,
            });
        }

        Details::Element(_) => {}
    }

    return Err(WasmError::Guest(
        "we dont the entry details for the given hash".into(),
    ));

}

fn element_to_invitation(element: Element) -> ExternResult<(HeaderHashed, Invitation)> {
    let entry = element
        .entry()
        .as_option()
        .ok_or(WasmError::Guest("Malformed Invitation entry".into()))?;

    let invitation = entry_to_invitation(entry)?;

    Ok((element.header_hashed().clone(), invitation))
}

fn entry_to_invitation(entry: &Entry) -> ExternResult<Invitation> {
    let bytes = match entry.clone() {
        Entry::App(bytes) => Ok(bytes.into_sb()),
        Entry::CounterSign(_, bytes) => Ok(bytes.into_sb()),
        _ => Err(WasmError::Guest("Malformed Invitation entry".into())),
    }?;

    let result = Invitation::try_from(bytes)
        .or(Err(WasmError::Guest("Malformed GameResults entry".into())))?;

    Ok(result)
}
