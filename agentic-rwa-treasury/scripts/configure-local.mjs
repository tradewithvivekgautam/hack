import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const privateKey = process.argv[2] ?? process.env.LOCAL_AGENT_PRIVATE_KEY;
if (!privateKey || !/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
  throw new Error(
    "Pass the local Hardhat account private key: npm run local:configure -- 0x<64 hex characters>",
  );
}

const source = path.resolve("deployments/chain-31337.json");
const deployment = JSON.parse(await readFile(source, "utf8"));
if (deployment.chainId !== 31_337) {
  throw new Error("deployments/chain-31337.json does not target chain 31337.");
}

const deploymentTargets = [
  path.resolve("packages/shared/src/generated/deployment.json"),
  path.resolve("apps/web/src/config/generated-deployment.json"),
];
for (const target of deploymentTargets) {
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);
}

const webEnvironment = `NEXT_PUBLIC_APP_MODE=live
NEXT_PUBLIC_DEFAULT_CHAIN_ID=31337
NEXT_PUBLIC_LOCAL_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_XLAYER_TESTNET_RPC_URL=https://testrpc.xlayer.tech/terigon
NEXT_PUBLIC_XLAYER_MAINNET_RPC_URL=https://rpc.xlayer.tech
NEXT_PUBLIC_IPFS_GATEWAY_URL=https://ipfs.io/ipfs
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_REPOSITORY_URL=
IPFS_LOCAL_DIRECTORY=../agent/.data/ipfs
`;

const agentEnvironment = `NODE_ENV=development
LOG_LEVEL=info
AGENT_PROVIDER=fixture
AGENT_MODEL=deepseek-v4-pro
AGENT_TEMPERATURE=0.1
CHAIN_MODE=live
XLAYER_CHAIN_ID=31337
XLAYER_RPC_URL=http://127.0.0.1:8545
AGENT_PRIVATE_KEY=${privateKey}
IPFS_PROVIDER=local
IPFS_LOCAL_DIRECTORY=.data/ipfs
CORPUS_MANIFEST=corpus/sources.json
SOURCE_CACHE_DIRECTORY=.data/source-cache
DIAGNOSTICS_PROVIDER=sqlite
DIAGNOSTICS_SQLITE_PATH=.data/agent.sqlite
AGENT_CRON=0 * * * *
AGENT_RUN_ON_START=false
`;

await writeFile(path.resolve("apps/web/.env.local"), webEnvironment, "utf8");
await writeFile(path.resolve("apps/agent/.env"), agentEnvironment, "utf8");

console.log("Synchronized the chain-31337 deployment.");
console.log("Wrote apps/web/.env.local and apps/agent/.env for live local mode.");
