import { chainById } from "@agentic-rwa/shared";
import { webEnv } from "@/config/env";

export const dynamic = "force-dynamic";

export function GET() {
  const chain = chainById(webEnv.defaultChainId);
  return Response.json(
    {
      ok: true,
      service: "agentic-rwa-web",
      mode: webEnv.appMode,
      chainId: chain.id,
      chain: chain.name,
      contractsConfigured: webEnv.contractsConfigured,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
