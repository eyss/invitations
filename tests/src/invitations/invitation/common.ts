import { CallableCell } from '@holochain/tryorama';
import { NewEntryAction, ActionHash, Record, AppBundleSource, fakeActionHash, fakeAgentPubKey, fakeEntryHash, fakeDnaHash, AgentPubKey, EntryHash } from '@holochain/client';

export const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function sendInvitations(cell: CallableCell, invitees:AgentPubKey[]): Promise<Record> {
    return cell.callZome({
      zome_name: "invitation",
      fn_name: "send_invitations",
      payload: invitees,
    });
}

export async function getPendingInvitations(cell: CallableCell): Promise<Record> {
    return cell.callZome({
      zome_name: "invitations",
      fn_name: "get_my_pending_invitations",
      payload: null,
    });
}

export async function acceptInvitation(cell: CallableCell, entryhash: EntryHash ): Promise<Record> {
    return cell.callZome({
      zome_name: "invitations",
      fn_name: "accept_invitation",
      payload: entryhash,
    });
}

export async function clearInvitation(cell: CallableCell, entryhash: EntryHash ): Promise<Record> {
    return cell.callZome({
      zome_name: "invitations",
      fn_name: "clear_invitation",
      payload: entryhash,
    });
}

