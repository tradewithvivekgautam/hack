export const allocationTool = {
  type: "function",
  function: {
    name: "propose_allocation",
    description: "Return the bounded three-strategy allocation memo.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["allocations", "thesis", "risks", "confidence"],
      properties: {
        allocations: {
          type: "object",
          additionalProperties: false,
          required: ["rwa", "lending", "idle"],
          properties: Object.fromEntries(["rwa", "lending", "idle"].map((strategy) => [strategy, {
            type: "object",
            additionalProperties: false,
            required: ["weightBps", "rationale", "evidence"],
            properties: {
              weightBps: { type: "integer", minimum: 0, maximum: 10_000 },
              rationale: { type: "string", minLength: 12, maxLength: 2_000 },
              evidence: {
                type: "array", minItems: 1, maxItems: 6,
                items: {
                  type: "object", additionalProperties: false,
                  required: ["sourceId", "claim"],
                  properties: { sourceId: { type: "string" }, claim: { type: "string" } },
                },
              },
            },
          }])),
        },
        thesis: { type: "string", minLength: 40, maxLength: 4_000 },
        risks: { type: "array", minItems: 1, maxItems: 4, items: { type: "string" } },
        confidence: { type: "string", enum: ["low", "medium", "high"] },
      },
    },
  },
} as const;
