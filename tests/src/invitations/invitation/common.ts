import { CallableCell } from '@holochain/tryorama';
import { NewEntryAction, ActionHash, Record, AppBundleSource, fakeActionHash, fakeAgentPubKey, fakeEntryHash, fakeDnaHash, AgentPubKey, EntryHash, Action } from '@holochain/client';

export type InvitationEntryInfo = {
  inviter: AgentPubKey
  invitees: AgentPubKey[],
  timestamp: number,
  invitation_entry_hash: EntryHash,
  invitation_creation_hash: ActionHash,
  invitees_who_accepted: AgentPubKey[],
  invitees_who_rejected: AgentPubKey[]
}

export async function sendInvitations(cell: CallableCell, invitees:AgentPubKey[]): Promise<InvitationEntryInfo> {
  return cell.callZome({
    zome_name: "invitation",
    fn_name: "send_invitations",
    payload: invitees,
  });
}

export async function getPendingInvites(cell: CallableCell): Promise<InvitationEntryInfo[]> {
  return cell.callZome({
    zome_name: "invitation",
    fn_name: "get_my_pending_invitations",
    payload: null
  });
}

export async function acceptInvite(cell: CallableCell, creationHash:ActionHash): Promise<boolean> {
  return cell.callZome({
    zome_name: "invitation",
    fn_name: "accept_invitation",
    payload: creationHash
  });
}

export async function rejectInvite(cell:CallableCell, creationHash: ActionHash): Promise<boolean> {
  return cell.callZome({
    zome_name: "invitation",
    fn_name: "reject_invitation",
    payload: creationHash
  });
}

export async function clearInvite(cell:CallableCell, entryHash: EntryHash): Promise<boolean> {
  return cell.callZome({
    zome_name: "invitation",
    fn_name: "clear_invitation",
    payload: entryHash
  });
}

/*export async function createInvite(cell: CallableCell, invite = undefined): Promise<Record> {
    return cell.callZome({
      zome_name: "invitation",
      fn_name: "create_invite",
      payload: invite || await sampleInvite(cell),
    });
}

export async function sampleInvite(cell: CallableCell, partialInvite = {}) {
  return {
      ...{
  inviter: (await fakeAgentPubKey()),
  invitees: [(await fakeAgentPubKey())],
  timestamp: 1674053334548000,
      },
      ...partialInvite
  };
}*/

