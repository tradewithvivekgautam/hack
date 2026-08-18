import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LocalReasoningStore } from "../src/ipfs/local-store.js";

describe("local IPFS-compatible store", () => {
  it("stores and retrieves the exact canonical UTF-8 text", async () => {
    const directory = await mkdtemp(join(tmpdir(), "agentic-rwa-ipfs-"));
    const store = new LocalReasoningStore(directory);
    const content = '{"a":1,"b":2}';
    const { cid } = await store.pin(content);
    expect(cid).toMatch(/^baf/);
    expect(await store.get(cid)).toBe(content);
  });
});
