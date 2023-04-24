import { assert, test } from "vitest";

import { runScenario, pause, CallableCell } from '@holochain/tryorama';
import { NewEntryAction, ActionHash, Record, AppBundleSource, fakeDnaHash, fakeActionHash, fakeAgentPubKey, fakeEntryHash, AppSignalCb, AppSignal, RecordEntry } from '@holochain/client';
import { decode } from '@msgpack/msgpack';

import { acceptInvite, clearInvite, getPendingInvites, InvitationEntryInfo, rejectInvite, sendInvitations } from './common.js';


let processSignal: AppSignalCb | undefined;
const signalReceived = new Promise<AppSignal>((resolve) => {
    processSignal = (signal) => {
      console.log("signal found for Alice:",signal)
    resolve(signal);
  };
});

let processSignal_bob: AppSignalCb | undefined;
const signalReceived_bob = new Promise<AppSignal>((resolve) => {
    processSignal_bob = (signal) => {
      console.log("signal found for bob:",signal)
    resolve(signal);
  };
});

test('create and compare invitation lists', async () => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + '/../workdir/invitations.happ';

    // Set up the app to be installed 
    const appSource = { appBundleSource: { path: testAppPath } , options: {signalHandler: processSignal} };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource]);
    alice.conductor.appWs().on("signal",processSignal)

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    console.log("Alice creates an Invite")
    const invite_detail: InvitationEntryInfo = await sendInvitations(alice.cells[0],[bob.agentPubKey]);
    //console.log(invite_detail)//decode((record.entry as any).Present.entry as any))
    assert.ok(invite_detail);

    // Wait for the created entry to be propagated to the other node.
    await pause(1200);

    console.log("Bob gets his pending invites")
    const invite_list_bob: InvitationEntryInfo[] = await getPendingInvites(bob.cells[0])
    console.log(invite_list_bob)
    assert(invite_list_bob)
  
    console.log("Alice gets her pending Invites")
    const invite_list_alice: InvitationEntryInfo[] = await getPendingInvites(alice.cells[0])
    console.log(invite_list_alice)
    assert.deepEqual(invite_list_bob,invite_list_alice)
  
  });
});

test('create and accept Invite', async () => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + '/../workdir/invitations.happ';

    // Set up the app to be installed 
    const appSource = { appBundleSource: { path: testAppPath }, options: {signalHandler: processSignal} };
    const appSource_bob = { appBundleSource: { path: testAppPath }, options: {signalHandler: processSignal} };


    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice] = await scenario.addPlayersWithApps([appSource]);
    const [bob] = await scenario.addPlayersWithApps([appSource_bob]);

    alice.conductor.appWs().on("signal",processSignal)
    bob.conductor.appWs().on("signal",processSignal_bob)

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    console.log("Alice creates an Invite to Bob")
    const invite_detail: InvitationEntryInfo = await sendInvitations(alice.cells[0],[bob.agentPubKey]);
    assert.ok(invite_detail);

    await pause(1200);

    console.log("Bob gets signalled he has a new Invite") //todo get hash from signal not callzome
    const invite_list_bob: InvitationEntryInfo[] = await getPendingInvites(bob.cells[0])
    console.log(invite_list_bob)
    assert(invite_list_bob)
  
    console.log("last signal recieved:",signalReceived)

    console.log("Bob accepts the invite")
    const result: boolean = await acceptInvite(bob.cells[0],invite_list_bob[0].invitation_creation_hash)
    console.log(result)
    assert.isTrue(result)

    await pause(1200);

    console.log("Alice sees if Bob has accepted the invite") //todo react to accept signal
    const invite_list_alice: InvitationEntryInfo[] = await getPendingInvites(alice.cells[0])
    console.log(invite_list_alice)
    assert.deepEqual(invite_list_alice[0].invitees_who_accepted[0],bob.agentPubKey)
  });
});

test('create and reject Invite', async () => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + '/../workdir/invitations.happ';

    // Set up the app to be installed 
    const appSource = { appBundleSource: { path: testAppPath }, options: {signalHandler: processSignal} };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource]);

    alice.conductor.appWs().on("signal",processSignal)

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    console.log("Alice creates an Invite to Bob")
    const invite_detail: InvitationEntryInfo = await sendInvitations(alice.cells[0],[bob.agentPubKey]);
    assert.ok(invite_detail);

    await pause(1200);

    console.log("Bob gets signalled he has a new Invite") //todo get hash from signal not callzome
    const invite_list_bob: InvitationEntryInfo[] = await getPendingInvites(bob.cells[0])
    console.log(invite_list_bob)
    assert(invite_list_bob)
    

    console.log("Bob rejects an invitation")
    const reject: boolean = await rejectInvite(bob.cells[0],invite_list_bob[0].invitation_creation_hash)
    console.log(reject)
    
    await pause(1200);

    //console.log("last signal recieved:",signalReceived)

    console.log("Alice hears bob has rejected and checks the status of the invite") //signalled first?
    const invite_list_alice: InvitationEntryInfo[] = await getPendingInvites(alice.cells[0])
    console.log(invite_list_alice)

    assert.deepEqual(invite_list_alice[0].invitees_who_rejected[0],bob.agentPubKey)
    
    
    //console.log("Bob clears an old invitation")
    //const result: boolean = await bob.cells[0].callZome({
    //  zome_name: "invitation",
    //  fn_name: "clear_invitation",
    //  payload: ReadPendings_again[0].invitation_entry_hash
    //});
    //console.log(result)

   // console.log("Bob checks that he has deleted the invitation")
   // const ReadPendings_last: InvitationEntryInfo[] = await bob.cells[0].callZome({
   //   zome_name: "invitation",
   //   fn_name: "get_my_pending_invitations",
   //   payload: null
   // });
    //console.log(ReadPendings_last)
    //assert.isEmpty(ReadPendings_last)
  });
});

test('create, reject and clear Invite', async () => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + '/../workdir/invitations.happ';

    // Set up the app to be installed 
    const appSource = { appBundleSource: { path: testAppPath }, options: {signalHandler: processSignal} };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource]);

    alice.conductor.appWs().on("signal",processSignal)

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    console.log("Alice creates an Invite to Bob")
    const invite_detail: InvitationEntryInfo = await sendInvitations(alice.cells[0],[bob.agentPubKey]);
    assert.ok(invite_detail);

    await pause(1200);

    console.log("Bob gets signalled he has a new Invite") //todo get hash from signal not callzome
    let invite_list_bob: InvitationEntryInfo[] = await getPendingInvites(bob.cells[0])
    console.log(invite_list_bob)
    assert(invite_list_bob)
    

    console.log("Bob rejects an invitation")
    const reject: boolean = await rejectInvite(bob.cells[0],invite_list_bob[0].invitation_creation_hash)
    console.log(reject)
    
    await pause(1200);

    //console.log("last signal recieved:",signalReceived)

    console.log("Bob gets signalled he has a new Invite") //todo get hash from signal not callzome
    invite_list_bob  = await getPendingInvites(bob.cells[0])
    console.log(invite_list_bob)
    assert(invite_list_bob)
    
    console.log("Bob clears the invitation")
    const result: boolean = await clearInvite(bob.cells[0], invite_list_bob[0].invitation_entry_hash)
    console.log(result)

    console.log("Bob checks that he has deleted the invitation from his list")
    invite_list_bob  = await getPendingInvites(bob.cells[0])
    console.log(invite_list_bob)
    assert.isEmpty(invite_list_bob)
  });
});
