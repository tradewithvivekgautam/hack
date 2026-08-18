import type { AgentConfig } from "../config/env.js";
import type { DiagnosticsStore } from "../domain/ports.js";
import { NullDiagnosticsStore } from "./null-diagnostics.js";
import { SqliteDiagnosticsStore } from "./sqlite-diagnostics.js";

export function createDiagnosticsStore(config: AgentConfig): DiagnosticsStore {
  return config.diagnostics.provider === "none"
    ? new NullDiagnosticsStore()
    : new SqliteDiagnosticsStore(config.diagnostics.sqlitePath);
}
