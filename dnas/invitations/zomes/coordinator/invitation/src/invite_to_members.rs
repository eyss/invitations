use hdk::prelude::*;
use invitation_integrity::*;

#[derive(Serialize, Deserialize, Debug)]
pub struct AddMemberForInviteInput {
    pub base_invite_hash: EntryHash,
    pub target_member: AgentPubKey,
}
#[hdk_extern]
pub fn add_member_for_invite(input: AddMemberForInviteInput) -> ExternResult<()> {
    create_link(input.base_invite_hash.clone(), input.target_member.clone(), LinkTypes::InviteToMembers, ())?;
    Ok(())    
}

#[hdk_extern]
pub fn get_members_for_invite(invite_hash: EntryHash) -> ExternResult<Vec<AgentPubKey>> {
    let links = get_links(invite_hash, LinkTypes::InviteToMembers, None)?;
    
    let agents: Vec<AgentPubKey> = links
        .into_iter()
        .map(|link| AgentPubKey::from(EntryHash::from(link.target)))
        .collect();

    Ok(agents)
}

        
#[derive(Serialize, Deserialize, Debug)]
pub struct RemoveMemberForInviteInput {
    pub base_invite_hash: EntryHash,
    pub target_member: AgentPubKey,
}
#[hdk_extern]
pub fn remove_member_for_invite(input: RemoveMemberForInviteInput ) -> ExternResult<()> {
    let links = get_links(input.base_invite_hash.clone(), LinkTypes::InviteToMembers, None)?;
    
    for link in links {
        if AgentPubKey::from(EntryHash::from(link.target.clone())).eq(&input.target_member) {
            delete_link(link.create_link_hash)?;
        }
    }
    

    Ok(())        
}