async function main() {
  const userAddress = "0x5A93D2ad2342bf9ED3fDD2E842878D0C24f97323";
  console.log(`Testing /api/vault/relay for user ${userAddress}...`);
  
  const response = await fetch("http://localhost:3000/api/vault/relay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "deposit",
      address: userAddress,
      amount: "10000000000", // 10,000 USDC
    }),
  });

  console.log(`Status: ${response.status}`);
  const result = await response.json();
  console.log("Result:", result);
}

main().catch(console.error);
