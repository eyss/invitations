import { assert, test } from "vitest";

import { runScenario, pause, CallableCell } from '@holochain/tryorama';
import { NewEntryAction, ActionHash, Record, AppBundleSource, fakeDnaHash, fakeActionHash, fakeAgentPubKey, fakeEntryHash, AppSignalCb, AppSignal, RecordEntry } from '@holochain/client';
import { decode } from '@msgpack/msgpack';

import { createInvite, InvitationEntryInfo, sampleInvite, sendInvitations } from './common.js';


let processSignal: AppSignalCb | undefined;
const signalReceived = new Promise<AppSignal>((resolve) => {
    processSignal = (signal) => {
      console.log("signal found:",signal)
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

test('create and read Invite', async () => {
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

    //const sample = await sampleInvite(alice.cells[0]);

    console.log("Alice creates an Invite")
    //const record: Record = await createInvite(alice.cells[0], sample);
    const record: Record = await sendInvitations(alice.cells[0],[bob.agentPubKey]);
    console.log(decode((record.entry as any).Present.entry as any))
    assert.ok(record);

    // Wait for the created entry to be propagated to the other node.
    await pause(1200);

    console.log("Bob gets the created Invite")
    const createReadOutput_bob: Record = await bob.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "get_my_pending_invitations",
      payload: null //record.signed_action.hashed.hash,
    });
    console.log(createReadOutput_bob)
    assert(createReadOutput_bob)
    //assert.deepEqual(decode((record.entry as any).Present.entry) as any, decode((createReadOutput.entry as any).Present.entry) as any);
  
     console.log("Alice gets her created Invites")
     const createReadOutput_alice: Record = await alice.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "get_my_pending_invitations",
      payload: null //record.signed_action.hashed.hash,
    });
    console.log(createReadOutput_alice)
    assert.deepEqual(createReadOutput_alice,createReadOutput_bob)
  
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
    const record: Record = await sendInvitations(alice.cells[0],[bob.agentPubKey]);
    console.log(decode((record.entry as any).Present.entry as any))
    assert.ok(record);

    await pause(1200);

    console.log("Bob gets the created Invite")
    const ReadPendings: InvitationEntryInfo[] = await bob.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "get_my_pending_invitations",
      payload: null 
    });
    console.log(ReadPendings)
    assert(ReadPendings)
    
    console.log("last signal recieved:",signalReceived)
    console.log("Bob accepts the invite")
    const acceptOutput: Record = await bob.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "accept_invitation",
      payload: ReadPendings[0].invitation_action_hash //record.signed_action.hashed.hash,
    });
    console.log(decode((acceptOutput.entry as any).Present.entry as any))
    assert(acceptOutput)

    await pause(1200);

    console.log("Alice sees if Bob has accepted the invite")
    const ReadPendings_again: InvitationEntryInfo[] = await alice.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "get_my_pending_invitations",
      payload: null
    });
    console.log(ReadPendings_again)
    assert(ReadPendings_again)
    
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
    const record: Record = await sendInvitations(alice.cells[0],[bob.agentPubKey]);
    console.log(decode((record.entry as any).Present.entry as any))
    assert.ok(record);

    await pause(1200);

    console.log("Bob gets the created Invite")
    const ReadPendings: InvitationEntryInfo[] = await bob.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "get_my_pending_invitations",
      payload: null 
    });
    console.log(ReadPendings)
    assert(ReadPendings)
    

    console.log("Bob rejects an invitation")
    const reject: boolean = await bob.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "reject_invitation",
      payload: ReadPendings[0].invitation_action_hash
    });
    console.log(reject)
    
    await pause(1200);

    //console.log("last signal recieved:",signalReceived)

    console.log("Alice checks the status of the invite")
    const ReadPendings_again: InvitationEntryInfo[] = await alice.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "get_my_pending_invitations",
      payload: null
    });
    console.log(ReadPendings_again)
    assert(ReadPendings_again)
    
    //console.log("Bob clears an old invitation")
    //const result: boolean = await bob.cells[0].callZome({
    //  zome_name: "invitation",
    //  fn_name: "clear_invitation",
    //  payload: ReadPendings_again[0].invitation_entry_hash
    //});
    //console.log(result)

    console.log("Bob checks that he has deleted the invitation")
    const ReadPendings_last: InvitationEntryInfo[] = await bob.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "get_my_pending_invitations",
      payload: null
    });
    console.log(ReadPendings_last)
    //assert.isEmpty(ReadPendings_last)
  });
});

/*test('create and clear Invite', async () => {
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
    const record: Record = await sendInvitations(alice.cells[0],[bob.agentPubKey]);
    console.log(decode((record.entry as any).Present.entry as any))
    assert.ok(record);

    await pause(1200);

    console.log("Bob gets the created Invite")
    const ReadPendings: InvitationEntryInfo[] = await bob.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "get_my_pending_invitations",
      payload: null 
    });
    console.log(ReadPendings)
    assert(ReadPendings)
    

    console.log("Bob rejects an invitation")
    const reject: boolean = await bob.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "reject_invitation",
      payload: ReadPendings[0].invitation_entry_hash
    });
    console.log(reject)
    
    await pause(1200);

    //console.log("last signal recieved:",signalReceived)

    console.log("Bob checks the status of the invite")
    const ReadPendings_again: InvitationEntryInfo[] = await bob.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "get_my_pending_invitations",
      payload: null
    });
    console.log(ReadPendings_again)
    assert(ReadPendings_again)
    
    console.log("Bob clears an old invitation")
    const result: boolean = await bob.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "clear_invitation",
      payload: ReadPendings_again[0].invitation_entry_hash
    });
    console.log(result)

    console.log("Bob checks that he has deleted the invitation")
    const ReadPendings_last: InvitationEntryInfo[] = await bob.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "get_my_pending_invitations",
      payload: null
    });
    console.log(ReadPendings_last)
    assert.isEmpty(ReadPendings_last)
  });
});



/*
test('create and update Invite', async () => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + '/../workdir/invitations.happ';

    // Set up the app to be installed 
    const appSource = { appBundleSource: { path: testAppPath } };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    // Alice creates a Invite
    const record: Record = await createInvite(alice.cells[0]);
    assert.ok(record);
        
    const originalActionHash = record.signed_action.hashed.hash;
 
    // Alice updates the Invite
    let contentUpdate: any = await sampleInvite(alice.cells[0]);
    let updateInput = {
      previous_invite_hash: originalActionHash,
      updated_invite: contentUpdate,
    };

    let updatedRecord: Record = await alice.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "update_invite",
      payload: updateInput,
    });
    assert.ok(updatedRecord);

    // Wait for the updated entry to be propagated to the other node.
    await pause(1200);
        
    // Bob gets the updated Invite
    const readUpdatedOutput0: Record = await bob.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "get_invite",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    assert.deepEqual(contentUpdate, decode((readUpdatedOutput0.entry as any).Present.entry) as any);

    // Alice updates the Invite again
    contentUpdate = await sampleInvite(alice.cells[0]);
    updateInput = { 
      previous_invite_hash: updatedRecord.signed_action.hashed.hash,
      updated_invite: contentUpdate,
    };

    updatedRecord = await alice.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "update_invite",
      payload: updateInput,
    });
    assert.ok(updatedRecord);

    // Wait for the updated entry to be propagated to the other node.
    await pause(1200);
        
    // Bob gets the updated Invite
    const readUpdatedOutput1: Record = await bob.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "get_invite",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    assert.deepEqual(contentUpdate, decode((readUpdatedOutput1.entry as any).Present.entry) as any);
  });
});

test('create and delete Invite', async () => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + '/../workdir/invitations.happ';

    // Set up the app to be installed 
    const appSource = { appBundleSource: { path: testAppPath } };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    // Alice creates a Invite
    const record: Record = await createInvite(alice.cells[0]);
    assert.ok(record);
        
    // Alice deletes the Invite
    const deleteActionHash = await alice.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "delete_invite",
      payload: record.signed_action.hashed.hash,
    });
    assert.ok(deleteActionHash);

    // Wait for the entry deletion to be propagated to the other node.
    await pause(1200);
        
    // Bob tries to get the deleted Invite
    const readDeletedOutput = await bob.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "get_invite",
      payload: record.signed_action.hashed.hash,
    });
    assert.notOk(readDeletedOutput);
  });
});*/
