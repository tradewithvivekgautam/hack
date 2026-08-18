import { describe, expect, it } from "vitest";
import { calculateTurnoverBps, evaluatePolicy } from "../src/policy.js";

const policy = { maxWeightBps: 6_000, maxTurnoverBps: 2_000, cooldownSeconds: 3_600 };

describe("policy mirror", () => {
  it("matches one-way portfolio turnover", () => {
    expect(calculateTurnoverBps(
      { rwa: 4_000, lending: 4_000, idle: 2_000 },
      { rwa: 5_500, lending: 3_000, idle: 1_500 },
    )).toBe(1_500);
  });

  it("rejects the malicious demo allocation", () => {
    const result = evaluatePolicy({
      current: { rwa: 4_500, lending: 3_500, idle: 2_000 },
      proposed: { rwa: 8_000, lending: 1_000, idle: 1_000 },
      policy,
      nowUnixSeconds: 1_000_000,
      lastRebalanceAtUnixSeconds: 0,
    });
    expect(result.accepted).toBe(false);
    expect(result.violations.some((violation) => violation.code === "STRATEGY_CAP")).toBe(true);
  });
});
