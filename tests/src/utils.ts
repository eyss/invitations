import { Config, InstallAgentsHapps } from "@holochain/tryorama";
import { serializeHash } from "@holochain-open-dev/core-types";
import { fileURLToPath } from "url";
import path from "path";
import assert from "assert";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const invitationsDna = path.join(
  __dirname,
  "../../workdir/dna/invitations.dna"
);

export const config = Config.gen();

export const installation: InstallAgentsHapps = [
  // one agent
  [[invitationsDna]],
];

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(() => resolve(null), ms));

export const authorPubKey = (author: any) => {
  assert(author instanceof Uint8Array, "AgentPubKey is not Uint8Array");
  return serializeHash(author);
};