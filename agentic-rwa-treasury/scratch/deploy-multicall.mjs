import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

async function main() {
  // 1. Fetch Multicall3 bytecode from X Layer Testnet where it is deployed
  const publicTestnet = createPublicClient({
    transport: http("https://xlayertestrpc.okx.com"),
  });
  
  console.log("Fetching Multicall3 bytecode from X Layer Testnet...");
  const bytecode = await publicTestnet.getBytecode({
    address: "0xcA11bde05977b3631167028862bE2a173976CA11",
  });

  if (!bytecode) {
    throw new Error("Could not fetch Multicall3 bytecode.");
  }
  console.log(`Fetched bytecode of length ${bytecode.length}`);

  // 2. Set the bytecode on our local Hardhat node at 0xcA11bde05977b3631167028862bE2a173976CA11
  const localClient = createPublicClient({
    transport: http("http://127.0.0.1:8545"),
  });

  console.log("Deploying Multicall3 bytecode to local Hardhat node deterministic address...");
  
  // We use hardhat RPC method 'hardhat_setCode'
  // Fetch via custom request to local Hardhat node
  const response = await fetch("http://127.0.0.1:8545", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "hardhat_setCode",
      params: ["0xcA11bde05977b3631167028862bE2a173976CA11", bytecode],
      id: 1,
    }),
  });

  const resJson = await response.json();
  if (resJson.error) {
    console.error("Error setting code:", resJson.error);
  } else {
    console.log("Successfully deployed Multicall3 to 0xcA11bde05977b3631167028862bE2a173976CA11!");
  }
}

main().catch(console.error);
