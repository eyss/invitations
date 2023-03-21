import { assert, test } from "vitest";

import { runScenario, pause, CallableCell, AppOptions } from '@holochain/tryorama';
import { NewEntryAction, ActionHash, Record, AppBundleSource, fakeDnaHash, fakeActionHash, fakeAgentPubKey, fakeEntryHash, AppSignalCb, AppSignal } from '@holochain/client';
import { decode } from '@msgpack/msgpack';

import { sendInvitations, getPendingInvitations, acceptInvitation, delay, clearInvitation, create_invitation } from './common.js';

let processSignal: AppSignalCb | undefined;
const signalReceived = new Promise<AppSignal>((resolve) => {
  processSignal = (signal) => {
    console.log(signal)
    resolve(signal);
  };
});

test('send invitation', async () => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + '/../workdir/invitations.happ';
    console.log(process.cwd())

    // Set up the app to be installed 
    const appSource = { appBundleSource: { path: testAppPath }, options: {signalHandler: processSignal} };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    // Alice creates a Post
    const record1: Record = await create_invitation(alice.cells[0]);
    assert.ok(record1);

    // Alice creates a Post
   // const record2: Record = await sendInvitations(alice.cells[0],  [bob.agentPubKey]);
   // assert.ok(record2);
  });
});
/*
test('get and accept invitation', async () => {
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

    let bob_invitations = await getPendingInvitations(bob.cells[0]);
     // await delay(2000);
      assert.ok(bob_invitations) //.length, 1)
      let  alice_invitations = await getPendingInvitations(alice.cells[0]);
     // await delay(2000);
      assert.ok(alice_invitations)//.length, 1)

      console.log("invitees:",alice_invitations[0].invitation.invitees);
      console.log("-")
      console.log(`Bob Invitations pending list:`);
      console.log(bob_invitations);
      console.log(bob_invitations[0].invitation.timestamp);
      assert.equal(bob_invitations[0].invitation.inviter, bob.agentPubKey)

      console.log(`Alice Invitations pending list:`);
      console.log(alice_invitations);
      assert.equal(alice_invitations[0].invitation.invitees[0],alice.agentPubKey)

      console.log(`Alice Excepts Invitation:`);
      console.log('-')
      await acceptInvitation(bob.cells[0],bob_invitations[0].invitation_entry_hash);
      await delay(4000);

      console.log(`Bobs history Invitation list:`);
      console.log(bob_invitations);

      console.log(`Alices history Invitation list:`);
      console.log(alice_invitations);
      // test that alice is in the accepted list.... 

  });
});

test('clear invitations', async () => {
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

    let alice_invitations = await getPendingInvitations(alice.cells[0]);
    let bob_invitations = await getPendingInvitations(bob.cells[0]);

    await clearInvitation(bob.cells[0],bob_invitations[0].invitation_entry_hash);
      //await delay(3000);
    await clearInvitation(alice.cells[0],bob_invitations[0].invitation_entry_hash)
      //await delay(2000);
    alice_invitations = await getPendingInvitations(alice.cells[0]);
    bob_invitations = await getPendingInvitations(bob.cells[0]);
     
 
    console.log(`Bobs new pending list:`);
    console.log(bob_invitations);
    assert.ok(bob_invitations)//.length, 0)

    console.log(`Alices new pending list:`);
    console.log(alice_invitations);
    assert.ok(alice_invitations)//.length, 0)
  });
});
*/

