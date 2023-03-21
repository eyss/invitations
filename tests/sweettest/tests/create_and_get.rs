use std::collections::BTreeMap;

use invitation_integrity::*;
use hdk::prelude::*;
use holochain::test_utils::consistency_10s;
use holochain::{conductor::config::ConductorConfig, sweettest::*};

#[tokio::test(flavor = "multi_thread")]
async fn create_and_get() {
    // Use prebuilt DNA file
    let dna_path = std::env::current_dir()
        .unwrap()
        .join("../../dnas/invitations/workdir/invitation-test.dna");
    let dna = SweetDnaFile::from_bundle(&dna_path).await.unwrap();

    // Set up conductors
    let mut conductors = SweetConductorBatch::from_config(2, ConductorConfig::default()).await;
    let apps = conductors.setup_app("invitations", &[dna]).await.unwrap();
    conductors.exchange_peer_info().await;

    let ((alice,), (bobbo,)) = apps.into_tuples();

    let alice_zome = alice.zome("invitation");
    let bob_zome = bobbo.zome("invitation");

    let invitees = vec![bobbo.agent_pubkey()];

    // Try to get my profile before creating one. Should return None.
    let record_1: Option<Record> = conductors[0]
        .call(&alice_zome, "send_invitations", invitees)
        .await;
    assert_eq!(record_1, None);

}
