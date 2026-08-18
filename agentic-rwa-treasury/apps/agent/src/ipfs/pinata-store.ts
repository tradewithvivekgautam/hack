import type { ReasoningStore } from "../domain/ports.js";

export class PinataReasoningStore implements ReasoningStore {
  constructor(private readonly jwt: string) {}

  async pin(canonicalJson: string) {
    const body = new FormData();
    body.append("file", new Blob([canonicalJson], { type: "application/json" }), "reasoning.json");
    body.append("pinataMetadata", JSON.stringify({ name: `agentic-rwa-${Date.now()}.json` }));
    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { authorization: `Bearer ${this.jwt}` },
      body,
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) throw new Error(`Pinata returned HTTP ${response.status}: ${await response.text()}`);
    const result = await response.json() as { IpfsHash?: string };
    if (!result.IpfsHash) throw new Error("Pinata response did not contain IpfsHash.");
    return { cid: result.IpfsHash, gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}` };
  }

  async get(cid: string): Promise<string> {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${encodeURIComponent(cid)}`, { signal: AbortSignal.timeout(20_000) });
    if (!response.ok) throw new Error(`Pinata gateway returned HTTP ${response.status}.`);
    return response.text();
  }
}
