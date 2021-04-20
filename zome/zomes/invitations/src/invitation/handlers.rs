use hdk::prelude::*;

use crate::signals::{SignalDetails, SignalName, SignalPayload};

use super::{Invitation, InvitationEntryInfo, InviteesList};

pub fn send_invitation(invitees_list: InviteesList) -> ExternResult<()> {
    //#1 WE CREATE THE INVITATION ENTRY:
    let agent_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey;

    let invitation = Invitation {
        invitees: invitees_list.clone().0,
        inviter: agent_pub_key.clone(),
        timestamp: sys_time()?,
    };

    let invitation_entry_hash: EntryHash = hash_entry(invitation.clone())?;
    let _invitation_header_hash: HeaderHash = create_entry(invitation.clone())?;

    // #2 WE LINK THE INVITATION CREATOR TO THIS INVITATION ENTRY
    create_link(
        agent_pub_key.into(),
        invitation_entry_hash.clone(),
        LinkTag::new(String::from("Inviter")),
    )?;

    for invitee in invitees_list.clone().0.iter() {
        // #2  WE HAVE TO LINK EACH INVITEE TO THIS INVITATION ENTRY
        create_link(
            invitee.clone().into(),
            invitation_entry_hash.clone(),
            LinkTag::new(String::from("Invited")),
        )?;
    }

    let signal: SignalDetails = SignalDetails {
        name: SignalName::INVITATION_RECEIVED.to_owned(),
        payload: SignalPayload::InvitationReceived(invitation_entry_hash),
    };

    remote_signal(ExternIO::encode(signal)?, invitees_list.0)?;

    Ok(())
}

pub fn get_sent_invitations() -> ExternResult<Vec<InvitationEntryInfo>> {
    let agent_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey;

    let sended_invitations_links: Vec<Link> = get_links(
        agent_pub_key.into(),
        Some(LinkTag::new(String::from("Inviter"))),
    )?
    .into_inner();

    get_invitations_entries_info_from_links(sended_invitations_links)
}

pub fn get_received_invitations() -> ExternResult<Vec<InvitationEntryInfo>> {
    let agent_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey;

    let received_invitations_links: Vec<Link> = get_links(
        agent_pub_key.into(),
        Some(LinkTag::new(String::from("Invited"))),
    )?
    .into_inner();

    get_invitations_entries_info_from_links(received_invitations_links)
}

pub fn reject_invitation(invitation_header_hash: HeaderHash) -> ExternResult<bool> {
    //THE CURRENT IMPLEMETATION OF THE INVITATION WILL BE THIS: IF AT LEAST ONE INVITEES REJECTED THE INVITATION THE INVITATION WILL BE DELETED

    let invitation_entry_info: InvitationEntryInfo =
        get_invitation_entry_info::<HeaderHash>(invitation_header_hash.clone())?;
    delete_invitation_entry(invitation_entry_info.clone())?;

    let signal: SignalDetails = SignalDetails {
        name: SignalName::INVITATION_REJECTED.to_owned(),
        payload: SignalPayload::InvitationRejected(invitation_entry_info.invitation.clone()),
    };

    remote_signal(
        ExternIO::encode(signal)?,
        invitation_entry_info.invitation.invitees,
    )?;

    Ok(true)
}

pub fn accept_invitation(invitation_header_hash: HeaderHash) -> ExternResult<bool> {
    // # WE WILL HANDLE THE INVITATION ACCEPTING PROCESS A BIT DIFERENCE DEPENDING IF THE INVITATION HAVE ONE OR SEVERAL INVITEES
    // #1 WE GET THE INVITATION ENTRY

    let invitation_entry_info: InvitationEntryInfo =
        get_invitation_entry_info::<HeaderHash>(invitation_header_hash.clone())?;
    let invitation: Invitation = invitation_entry_info.clone().invitation;
    let invitation_entry_hash: EntryHash = invitation_entry_info.clone().invitation_entry_hash;
    // let invitation_header_hash: HeaderHash = invitation_entry_info.clone().invitation_header_hash;

    let signal: SignalDetails;

    // #2 WE HAVE TO CHECK HOW MANY OF THE INVITEES ALREADY ACCEPTED THIS INVITATION, IF ALL OF THEN ACEPPTED WE CAN DELETE THE INVITATION ENTRY, AND ALL THE LINKS BETWEEN EACH AGENT AND THIS INVITATION
    // IF NOT WE JUST CREATE A NEW  LINK  BETWEEN THE AGENT WHO CALLS THIS METHOD AND THE INVITATION ENTRY TO TELL THE OTHERS INVITEES WE HAVE ACCEPTED THIS INVITATION

    let mut invitatees_who_already_accepted: Vec<AgentPubKey> = get_links(
        invitation_entry_hash.clone(),
        Some(LinkTag::new(String::from("accepted"))),
    )?
    .into_inner()
    .iter()
    .map(|link| -> AgentPubKey {
        let invitee_pub_key: AgentPubKey = link.target.clone().into(); //THIS ASSUMPTION HERE IS BEACUSE WE KNOW THE TARGETS OF THIS LINKS WILL BE THE INVITEES_PUB_KEYS
        return invitee_pub_key;
    })
    .collect();

    invitatees_who_already_accepted.append(&mut vec![agent_info()?.agent_latest_pubkey]);

    if invitation.invitees == invitatees_who_already_accepted {
        // #3 ALL THE INVITEES ACCEPTED THIS INVITATION WE WILL DELETE THE ENTRY AND ALL THE LINKS BETWEEN ENTRIES AND INVITEES

        delete_invitation_entry(invitation_entry_info)?;

        signal = SignalDetails {
            name: SignalName::INVITATION_ACCEPTED.to_owned(),
            payload: SignalPayload::InvitationAccepted(invitation.clone()),
        };
    } else {
        create_link(
            invitation_entry_hash.clone(),
            agent_info()?.agent_latest_pubkey.into(),
            LinkTag::new(String::from("accepted")),
        )?;

        signal = SignalDetails {
            name: SignalName::INVITATION_UPDATED.to_owned(),
            payload: SignalPayload::InvitationStatusUpdated(invitation_entry_hash),
        };
    }

    remote_signal(ExternIO::encode(signal)?, invitation.invitees)?;

    Ok(true)
}

// //HELPERS
fn get_invitations_entries_info_from_links(
    links: Vec<Link>,
) -> ExternResult<Vec<InvitationEntryInfo>> {
    let mut invitations_entries_info: Vec<InvitationEntryInfo> = vec![];

    for link in links.into_iter() {
        let invitation_entry_info: InvitationEntryInfo =
            get_invitation_entry_info::<EntryHash>(link.target)?;
        invitations_entries_info.push(invitation_entry_info);
    }
    Ok(invitations_entries_info)
}

fn get_invitation_entry_info<H>(input_hash: H) -> ExternResult<InvitationEntryInfo>
where
    AnyDhtHash: From<H>,
{
    match get(input_hash, GetOptions::content())? {
        Some(element) => match element.entry().to_app_option::<Invitation>()? {
            Some(invitation) => {
                return Ok(InvitationEntryInfo {
                    invitation: invitation.clone(),
                    invitation_entry_hash: hash_entry(invitation)?,
                    invitation_header_hash: element.header_address().to_owned(),
                });
            }
            None => {}
        },
        None => {}
    }

    return Err(WasmError::Guest(
        "we dont found the invitation entry for the given hash".into(),
    ));
}

fn delete_invitation_entry(invitation_entry_info: InvitationEntryInfo) -> ExternResult<()> {
    let invitation: Invitation = invitation_entry_info.invitation;
    let invitation_entry_hash: EntryHash = invitation_entry_info.invitation_entry_hash;
    let invitation_header_hash: HeaderHash = invitation_entry_info.invitation_header_hash;

    for link in get_links(invitation_entry_hash.clone(), None)?
        .into_inner()
        .into_iter()
    {
        delete_link(link.create_link_hash)?;
    }

    for invitee in invitation.clone().invitees.into_iter() {
        let invitee_links: Vec<Link> = get_links(
            invitee.clone().into(),
            Some(LinkTag::new(String::from("Invited"))),
        )?
        .into_inner();

        for link in invitee_links.into_iter() {
            if link.target == invitation_entry_hash {
                delete_link(link.create_link_hash)?;
            }
        }
    }

    let inviter_links: Vec<Link> = get_links(
        invitation.inviter.clone().into(),
        Some(LinkTag::new(String::from("Inviter"))),
    )?
    .into_inner();

    for link in inviter_links.into_iter() {
        if link.target == invitation_entry_hash {
            delete_link(link.create_link_hash)?;
        }
    }

    delete_entry(invitation_header_hash)?;

    Ok(())
}
