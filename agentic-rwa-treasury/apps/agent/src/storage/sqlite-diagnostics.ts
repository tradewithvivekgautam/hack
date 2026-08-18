import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { DiagnosticsStore, EpochDiagnostic } from "../domain/ports.js";

export class SqliteDiagnosticsStore implements DiagnosticsStore {
  private readonly database: DatabaseSync;
  private readonly insert;

  constructor(path: string) {
    mkdirSync(dirname(path), { recursive: true });
    this.database = new DatabaseSync(path);
    this.database.exec("PRAGMA journal_mode = WAL");
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS epochs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requested_at TEXT NOT NULL,
        completed_at TEXT NOT NULL,
        status TEXT NOT NULL,
        provider TEXT NOT NULL,
        model_id TEXT,
        proposal_json TEXT,
        envelope_json TEXT,
        reasoning_hash TEXT,
        reasoning_cid TEXT,
        tx_hash TEXT,
        error TEXT
      )
    `);
    this.insert = this.database.prepare(`
      INSERT INTO epochs (
        requested_at, completed_at, status, provider, model_id, proposal_json,
        envelope_json, reasoning_hash, reasoning_cid, tx_hash, error
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
  }

  async record(diagnostic: EpochDiagnostic): Promise<void> {
    this.insert.run(
      diagnostic.requestedAt,
      diagnostic.completedAt,
      diagnostic.status,
      diagnostic.provider,
      diagnostic.modelId ?? null,
      diagnostic.proposalJson ?? null,
      diagnostic.envelopeJson ?? null,
      diagnostic.reasoningHash ?? null,
      diagnostic.reasoningCid ?? null,
      diagnostic.txHash ?? null,
      diagnostic.error ?? null,
    );
  }

  async close(): Promise<void> {
    this.database.close();
  }
}
