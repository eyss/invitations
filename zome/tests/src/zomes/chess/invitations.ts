import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { Orchestrator } from "@holochain/tryorama";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const createGame = (players: Buffer[]) =>  (conductor) =>  conductor.call("chess", "create_game", players);


export function ZomeTest(config, installables) {

    let orchestrator = new Orchestrator();

    orchestrator.registerScenario("zome tests", async (s: ScenarioApi, t) => {

        const [alice, bobby] = await s.players([config, config]);

        const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
        const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);

        const alicePubKey = alice_happ.agent;
        const bobbyPubKey = bobby_happ.agent;

        const alice_conductor = alice_happ.cells[0];
        const bobby_conductor = bobby_happ.cells[0];

        console.log("Hello World");
        

    });

    orchestrator.run();
}

