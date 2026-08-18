export type SourceStatus = {
  id: string;
  title: string;
  kind: string;
  publishedAt: string;
  fetchedAt: string;
  contentHash: string;
  stale: boolean;
  description: string;
  integration: "live" | "fixture" | "chain";
};
