import type { AgentConfig } from "../config/env.js";
import type { AllocationProvider } from "../domain/ports.js";
import { FixtureAllocationProvider } from "./fixture.js";
import { OpenAiCompatibleProvider } from "./openai-compatible.js";

export function createAllocationProvider(config: AgentConfig): AllocationProvider {
  if (config.provider === "fixture") return new FixtureAllocationProvider();
  if (config.provider === "deepseek") {
    return new OpenAiCompatibleProvider({ provider: "deepseek", baseUrl: config.deepseek.baseUrl, apiKey: config.deepseek.apiKey, model: config.model, temperature: config.temperature, strictTools: true });
  }
  if (config.provider === "modal") {
    return new OpenAiCompatibleProvider({ provider: "modal", baseUrl: config.modal.baseUrl, apiKey: config.modal.apiKey, model: config.model, temperature: config.temperature, strictTools: false });
  }
  return new OpenAiCompatibleProvider({ provider: "ollama", baseUrl: config.ollama.baseUrl, apiKey: "ollama", model: config.model, temperature: config.temperature, strictTools: false });
}
