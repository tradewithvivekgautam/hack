import { createHmac } from "node:crypto";

async function main() {
  const apiKey = "9e170f69-a716-4012-ba95-c3943149e8a3";
  const secretKey = "1FBC2743DE49820CA81B03EC6361FCFE";
  const passphrase = "Hedgez0202@";

  // OKX DEX aggregator token addresses for X Layer
  // RWA Token Address (USDC or custom token address)
  const fromTokenAddress = "0x1952000000000000000000000000000000000001"; // Mock RWA exit address / OKX token address
  const toTokenAddress = "0x1952000000000000000000000000000000000002"; 
  const amount = "100000000000000000000000";

  const query = new URLSearchParams({
    chainIndex: "196",
    fromTokenAddress: "0x1e15db63ef549f2ca255338adfa4d48449f69242", // Target token on X Layer
    toTokenAddress: "0x98b0c49ce7734ce288f8367e1bb143e90bb3f0512",
    amount: "1000000",
    swapMode: "exactIn",
  });
  
  const requestPath = `/api/v6/dex/aggregator/quote?${query.toString()}`;
  const timestamp = new Date().toISOString();
  const signature = createHmac("sha256", secretKey)
    .update(`${timestamp}GET${requestPath}`)
    .digest("base64");

  console.log("Calling OKX DEX API Aggregator...");
  try {
    const response = await fetch(`https://web3.okx.com${requestPath}`, {
      headers: {
        "OK-ACCESS-KEY": apiKey,
        "OK-ACCESS-PASSPHRASE": passphrase,
        "OK-ACCESS-SIGN": signature,
        "OK-ACCESS-TIMESTAMP": timestamp,
      },
    });

    console.log(`Response Status: ${response.status}`);
    const json = await response.json();
    console.log("Response JSON:", JSON.stringify(json, null, 2));
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

main();
