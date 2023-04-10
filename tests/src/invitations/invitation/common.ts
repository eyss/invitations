import { CallableCell } from '@holochain/tryorama';
import { NewEntryAction, ActionHash, Record, AppBundleSource, fakeActionHash, fakeAgentPubKey, fakeEntryHash, fakeDnaHash, AgentPubKey, EntryHash, Action } from '@holochain/client';

export type InvitationEntryInfo = {
  inviter: AgentPubKey
  invitees: AgentPubKey[],
  timestamp: number,
  invitation_entry_hash: EntryHash,
  invitation_action_hash: ActionHash,
  invitees_who_accepted: AgentPubKey[],
  invitees_who_rejected: AgentPubKey[]
}

export async function sendInvitations(cell: CallableCell, invitees:AgentPubKey[]): Promise<Record> {
  return cell.callZome({
    zome_name: "invitation",
    fn_name: "send_invitations",
    payload: invitees,
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
}

export async function createInvite(cell: CallableCell, invite = undefined): Promise<Record> {
    return cell.callZome({
      zome_name: "invitation",
      fn_name: "create_invite",
      payload: invite || await sampleInvite(cell),
    });
}

