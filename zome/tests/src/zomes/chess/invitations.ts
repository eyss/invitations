import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { Orchestrator } from "@holochain/tryorama";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const sendInvitation = (guest_pub_key) => (conductor) => conductor.call("invitations", "send_invitation", guest_pub_key);
const getSentInvitations = (conductor) => conductor.call("invitations", "get_sent_invitations",);
const getReceivedInvitatons = (conductor) => conductor.call("invitations", "get_received_invitations",);
const acceptInvitation = (invitation_header_hash) =>(conductor) => conductor.call("invitations", "accept_invitation",invitation_header_hash);
const rejectInvitation = (invitation_header_hash) => (conductor) => conductor.call("invitations", "reject_invitation",invitation_header_hash);

export function ZomeTest(config, installables) {

    let orchestrator = new Orchestrator();

    orchestrator.registerScenario("zome tests", async (s: ScenarioApi, t) => {

        const [alice, bobby] = await s.players([config, config]);

        const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
        const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);

        await s.shareAllNodes([alice,bobby]);

        const alicePubKey = alice_happ.agent;
        const bobbyPubKey = bobby_happ.agent;

        const alice_conductor = alice_happ.cells[0];
        const bobby_conductor = bobby_happ.cells[0];


        let bobby_invitations_list :Buffer[] = [];

        bobby.setSignalHandler((signal) => {

            bobby_invitations_list.push(signal.data.payload.payload.InvitationReceived);
            console.log("Bobby has received Signal:",signal)
        })

        alice.setSignalHandler((signal) => {
            console.log("Alice has received Signal:",signal)
        })

        let result = await sendInvitation(bobbyPubKey)(alice_conductor);
        await delay(1000);

        let result_2 = await sendInvitation(bobbyPubKey)(alice_conductor);
        await delay(1000);

        const received_invitations = await getReceivedInvitatons(bobby_conductor);
        await delay(1000);

        const sended_invitations  = await  getSentInvitations(alice_conductor);
        await delay(1000);

        await delay(5000);

        t.deepEqual(received_invitations, sended_invitations, "the sended invitations from alice are exactly the received for bobby")


        const reject_invitation = await rejectInvitation(bobby_invitations_list[0])(bobby_conductor);
        await delay(1000);

        const received_invitations_2 = await getReceivedInvitatons(bobby_conductor);
        await delay(1000);



    

        console.log("Hello World");
        console.log(sended_invitations);
        console.log(received_invitations);
        console.log(bobby_invitations_list);
        console.log(reject_invitation);

    });

    orchestrator.run();
}

