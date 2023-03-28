import { assert, test } from "vitest";

import { runScenario, pause, CallableCell } from '@holochain/tryorama';
import { NewEntryAction, ActionHash, Record, AppBundleSource, fakeDnaHash, fakeActionHash, fakeAgentPubKey, fakeEntryHash, AppSignalCb, AppSignal } from '@holochain/client';
import { decode } from '@msgpack/msgpack';

import { createInvite, sampleInvite, sendInvitations } from './common.js';


let processSignal: AppSignalCb | undefined;
const signalReceived = new Promise<AppSignal>((resolve) => {
  processSignal = (signal) => {
    console.log(signal)
    resolve(signal);
  };
});

test('create Invite', async () => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + '/../workdir/invitations.happ';

    // Set up the app to be installed 
    const appSource = { appBundleSource: { path: testAppPath }, options: {signalHandler: processSignal} };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    // Alice creates a Invite
    const record: Record = await sendInvitations(alice.cells[0],[bob.agentPubKey]);

    //const record: Record = await createInvite(alice.cells[0]);
    assert.ok(record);
  });
});

test('create and read Invite', async () => {
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

    //const sample = await sampleInvite(alice.cells[0]);

    // Alice creates a Invite
    //const record: Record = await createInvite(alice.cells[0], sample);
    const record: Record = await sendInvitations(alice.cells[0],[bob.agentPubKey]);
    assert.ok(record);

    // Wait for the created entry to be propagated to the other node.
    await pause(1200);

    // Bob gets the created Invite
    const createReadOutput: Record = await bob.cells[0].callZome({
      zome_name: "invitation",
      fn_name: "get_invite",
      payload: record.signed_action.hashed.hash,
    });
    assert.deepEqual(decode((record.entry as any).Present.entry) as any, decode((createReadOutput.entry as any).Present.entry) as any);
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
