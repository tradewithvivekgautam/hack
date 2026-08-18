import type { DiagnosticsStore, EpochDiagnostic } from "../domain/ports.js";
export class NullDiagnosticsStore implements DiagnosticsStore {
  async record(_diagnostic: EpochDiagnostic): Promise<void> {}
  async close(): Promise<void> {}
}
