use chrono::{DateTime, NaiveDateTime, Utc};
use hdk::prelude::*;
use invitation_integrity::*;

#[derive(Serialize, Deserialize, Debug)]
pub struct InviteesListInput(pub Vec<AgentPubKey>);

#[hdk_extern]
fn send_invitations(invitees_list: InviteesListInput) -> ExternResult<()> {
  let agent_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey;

  let invited_agents: Vec<AgentPubKey> = invitees_list
      .0
      .clone()
      .into_iter()
      .map(|agent_pub_key| AgentPubKey::from(agent_pub_key))
      .collect();

  let now = sys_time()?.as_seconds_and_nanos();

  let date_time = DateTime::from_utc(NaiveDateTime::from_timestamp_opt(now.0, now.1).unwrap(), Utc);

  let invitation = Invitation {
      invitees: invited_agents,
      inviter: AgentPubKey::from(agent_pub_key.clone()),
      timestamp: date_time
    };

    let invitation_entry_hash: EntryHash = hash_entry(invitation.clone())?;
    create_entry(&EntryTypes::Invitation(invitation.clone()))?;

    create_link(
        agent_pub_key,
        invitation_entry_hash.clone(),
        LinkTypes::AgentToInvitation,
        LinkTag::new(String::from("Invitee")),
    )?;

    for agent in invitees_list.0.clone().into_iter() {
        create_link(
            agent,
            invitation_entry_hash.clone(),
            LinkTypes::AgentToInvitation,
            LinkTag::new(String::from("Invitee")),
        )?;
    }
    return Ok(());
}