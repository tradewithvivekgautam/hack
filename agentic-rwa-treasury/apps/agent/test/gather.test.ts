import { describe, expect, it } from "vitest";
import { FixtureChainGateway } from "../src/chain/fixture-gateway.js";
import type { DocumentSource } from "../src/domain/ports.js";
import { gatherDocuments } from "../src/sources/gather.js";
import { fixtureSources } from "./helpers.js";

const unavailableSource: DocumentSource = {
  id: "unavailable-source",
  async fetch() {
    throw new Error("upstream timeout");
  },
};

describe("document gathering", () => {
  it("makes partial source failures explicit in the model corpus", async () => {
    const fixture = await fixtureSources();
    const snapshot = await new FixtureChainGateway().snapshot();
    const documents = await gatherDocuments(
      [...fixture.sources, unavailableSource],
      snapshot,
    );
    const report = documents.find(
      (document) => document.id === "source-availability",
    );

    expect(report).toBeDefined();
    expect(report?.text).toContain("unavailable-source");
    expect(report?.text).toContain("upstream timeout");
    expect(documents.some((document) => document.id === "live-chain-state")).toBe(
      true,
    );
    expect(
      documents.some((document) => document.id === "recent-decision-history"),
    ).toBe(true);
  });
});
