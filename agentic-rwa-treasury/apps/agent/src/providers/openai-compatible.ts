import {
  AllocationProposalSchema,
  type AllocationProposal,
} from "@agentic-rwa/shared";
import OpenAI from "openai";
import type {
  AllocationProvider,
  ProviderContext,
  ProviderResult,
} from "../domain/ports.js";
import { buildUserPrompt, SYSTEM_PROMPT } from "./prompt.js";
import { allocationTool } from "./tool-schema.js";

export class OpenAiCompatibleProvider implements AllocationProvider {
  private readonly client: OpenAI;

  constructor(
    private readonly options: {
      provider: "deepseek" | "modal" | "ollama";
      baseUrl: string;
      apiKey: string;
      model: string;
      temperature: number;
      strictTools: boolean;
    },
  ) {
    this.client = new OpenAI({
      apiKey: options.apiKey || "local-provider",
      baseURL: options.baseUrl.replace(/\/$/, ""),
      maxRetries: 2,
      timeout: 180_000,
    });
  }

  async propose(context: ProviderContext): Promise<ProviderResult> {
    const response = await this.client.chat.completions.create({
      model: this.options.model,
      temperature: this.options.temperature,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: buildUserPrompt(context.documents, context.snapshot),
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            ...allocationTool.function,
            strict: this.options.strictTools,
          },
        },
      ],
      tool_choice: {
        type: "function",
        function: { name: "propose_allocation" },
      },
    });

    const call = response.choices[0]?.message.tool_calls?.find(
      (candidate) =>
        candidate.type === "function" &&
        candidate.function.name === "propose_allocation",
    );
    if (!call || call.type !== "function") {
      throw new Error("Model did not call propose_allocation.");
    }

    let raw: unknown;
    try {
      raw = JSON.parse(call.function.arguments);
    } catch {
      throw new Error("Model returned malformed tool arguments.");
    }

    const proposal: AllocationProposal = AllocationProposalSchema.parse(raw);
    return {
      proposal,
      provider: this.options.provider,
      modelId: this.options.model,
      temperature: this.options.temperature,
      reasoningMode: "enabled",
    };
  }
}
