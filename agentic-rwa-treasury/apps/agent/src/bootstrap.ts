import { createChainGateway } from "./chain/factory.js";
import { loadConfig } from "./config/env.js";
import { createLogger } from "./config/logger.js";
import { createReasoningStore } from "./ipfs/factory.js";
import { createAllocationProvider } from "./providers/factory.js";
import { CachedDocumentSource } from "./sources/cached-source.js";
import { sourcesFromManifest } from "./sources/manifest.js";
import { OkxLiquiditySource } from "./sources/okx-liquidity-source.js";
import { createDiagnosticsStore } from "./storage/factory.js";

export async function bootstrap(
  environment: NodeJS.ProcessEnv = process.env,
) {
  const config = loadConfig(environment);
  const logger = createLogger(config.logLevel);
  const sources = await sourcesFromManifest(
    config.corpusManifest,
    config.sourceCacheDirectory,
  );

  const okxConfigured = Boolean(
    config.okx.apiKey &&
      config.okx.secretKey &&
      config.okx.passphrase &&
      config.okx.tokenAddress &&
      config.okx.quoteTokenAddress,
  );
  if (okxConfigured) {
    sources.push(
      new CachedDocumentSource(
        new OkxLiquiditySource(config.okx),
        config.sourceCacheDirectory,
      ),
    );
  } else {
    logger.warn("source.okx_fixture_active", {
      reason: "Authenticated OKX credentials or token addresses are missing.",
    });
  }

  return {
    config,
    dependencies: {
      provider: createAllocationProvider(config),
      chain: createChainGateway(config),
      reasoningStore: createReasoningStore(config),
      diagnostics: createDiagnosticsStore(config),
      sources,
      logger,
    },
  };
}
