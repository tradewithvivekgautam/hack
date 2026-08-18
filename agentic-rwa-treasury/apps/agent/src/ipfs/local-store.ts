import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CID } from "multiformats/cid";
import * as raw from "multiformats/codecs/raw";
import { sha256 } from "multiformats/hashes/sha2";
import type { ReasoningStore } from "../domain/ports.js";

export class LocalReasoningStore implements ReasoningStore {
  constructor(private readonly directory: string) {}

  async pin(canonicalJson: string) {
    const bytes = new TextEncoder().encode(canonicalJson);
    const digest = await sha256.digest(bytes);
    const cid = CID.createV1(raw.code, digest).toString();
    await mkdir(this.directory, { recursive: true });
    await writeFile(join(this.directory, `${cid}.json`), bytes);
    return { cid, gatewayUrl: `local://${cid}` };
  }

  async get(cid: string): Promise<string> {
    return readFile(join(this.directory, `${cid}.json`), "utf8");
  }
}
