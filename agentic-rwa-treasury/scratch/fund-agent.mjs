async function main() {
  const agentAddress = "0x38dC1118b4370B1851eBda096D525d5D93044c74";
  console.log(`Setting balance for agent ${agentAddress} on local Hardhat chain...`);
  
  // Set balance to 1000 ETH (1000 * 10^18 wei = 0x3635c9adc5dea00000 wei)
  const response = await fetch("http://127.0.0.1:8545", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "hardhat_setBalance",
      params: [agentAddress, "0x3635c9adc5dea00000"],
      id: 1,
    }),
  });

  const resJson = await response.json();
  if (resJson.error) {
    console.error("Error setting balance:", resJson.error);
  } else {
    console.log(`Successfully funded agent address ${agentAddress} with 1000 ETH!`);
  }
}

main().catch(console.error);
