use hdk::prelude::*;
use invitation_integrity::*;
#[derive(Serialize, Deserialize, Debug)]
pub struct AddInviteForAgentInput {
    pub base_agent: AgentPubKey,
    pub target_invite_hash: EntryHash,
}
#[hdk_extern]
pub fn add_invite_for_agent(input: AddInviteForAgentInput) -> ExternResult<()> {
    create_link(
        input.base_agent.clone(),
        input.target_invite_hash.clone(),
        LinkTypes::AgentToInvites,
        (),
    )?;
    Ok(())
}
#[hdk_extern]
pub fn get_invites_for_agent(agent: AgentPubKey) -> ExternResult<Vec<Record>> {
    let links = get_links(agent, LinkTypes::AgentToInvites, None)?;
    let get_input: Vec<GetInput> = links
        .into_iter()
        .map(|link| GetInput::new(
            EntryHash::from(link.target).into(),
            GetOptions::default(),
        ))
        .collect();
    let records: Vec<Record> = HDK
        .with(|hdk| hdk.borrow().get(get_input))?
        .into_iter()
        .filter_map(|r| r)
        .collect();
    Ok(records)
}
#[derive(Serialize, Deserialize, Debug)]
pub struct RemoveInviteForAgentInput {
    pub base_agent: AgentPubKey,
    pub target_invite_hash: EntryHash,
}
#[hdk_extern]
pub fn remove_invite_for_agent(input: RemoveInviteForAgentInput) -> ExternResult<()> {
    let links = get_links(input.base_agent.clone(), LinkTypes::AgentToInvites, None)?;
    for link in links {
        if EntryHash::from(link.target.clone()).eq(&input.target_invite_hash) {
            delete_link(link.create_link_hash)?;
        }
    }
    Ok(())
}
