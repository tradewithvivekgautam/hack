import { resolve } from "node:path";
import { bundledDeployment, hasLiveDeployment } from "@agentic-rwa/shared";
import { isAddress } from "viem";
import { z } from "zod";

const optionalAddress = z
  .string()
  .refine((value) => !value || isAddress(value), "Invalid address")
  .default("");

const optionalPrivateKey = z
  .string()
  .refine(
    (value) => !value || /^0x[a-fA-F0-9]{64}$/.test(value),
    "Invalid private key",
  )
  .default("");

const optionalUrl = z
  .string()
  .refine((value) => !value || URL.canParse(value), "Invalid URL")
  .default("");

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  AGENT_PROVIDER: z
    .enum(["fixture", "deepseek", "modal", "ollama"])
    .default("fixture"),
  AGENT_MODEL: z.string().min(1).default("deepseek-v4-pro"),
  AGENT_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.1),
  DEEPSEEK_API_KEY: z.string().default(""),
  DEEPSEEK_BASE_URL: z
    .string()
    .url()
    .default("https://api.deepseek.com/beta"),
  MODAL_API_KEY: z.string().default(""),
  MODAL_BASE_URL: optionalUrl,
  OLLAMA_BASE_URL: z
    .string()
    .url()
    .default("http://127.0.0.1:11434/v1"),
  CHAIN_MODE: z.enum(["fixture", "live"]).default("fixture"),
  XLAYER_CHAIN_ID: z.coerce.number().int().refine(
    (value) => value === 31_337 || value === 1_952 || value === 196,
    "XLAYER_CHAIN_ID must be 31337, 1952, or 196",
  ).default(1952),
  XLAYER_RPC_URL: z
    .string()
    .url()
    .default("https://testrpc.xlayer.tech/terigon"),
  AGENT_PRIVATE_KEY: optionalPrivateKey,
  VAULT_ADDRESS: optionalAddress,
  POLICY_ADDRESS: optionalAddress,
  REGISTRY_ADDRESS: optionalAddress,
  RWA_ADAPTER_ADDRESS: optionalAddress,
  LENDING_ADAPTER_ADDRESS: optionalAddress,
  IDLE_ADAPTER_ADDRESS: optionalAddress,
  IPFS_PROVIDER: z.enum(["local", "pinata"]).default("local"),
  IPFS_LOCAL_DIRECTORY: z.string().default(".data/ipfs"),
  PINATA_JWT: z.string().default(""),
  CORPUS_MANIFEST: z.string().default("corpus/sources.json"),
  SOURCE_CACHE_DIRECTORY: z.string().default(".data/source-cache"),
  DIAGNOSTICS_PROVIDER: z.enum(["sqlite", "none"]).default("sqlite"),
  DIAGNOSTICS_SQLITE_PATH: z.string().default(".data/agent.sqlite"),
  AGENT_CRON: z.string().default("0 * * * *"),
  AGENT_RUN_ON_START: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  OKX_API_KEY: z.string().default(""),
  OKX_SECRET_KEY: z.string().default(""),
  OKX_PASSPHRASE: z.string().default(""),
  OKX_RWA_TOKEN_ADDRESS: optionalAddress,
  OKX_QUOTE_TOKEN_ADDRESS: optionalAddress,
  OKX_QUOTE_AMOUNT: z.string().regex(/^\d+$/).default("100000000000000000000000"),
  OKX_QUOTE_NOTIONAL_USD: z.coerce.number().positive().default(100_000),
});

export type AgentConfig = ReturnType<typeof loadConfig>;

export function loadConfig(environment: NodeJS.ProcessEnv = process.env) {
  const parsed = EnvSchema.parse(environment);
  const cwd = process.cwd();
  const synchronizedDeployment =
    bundledDeployment.chainId === parsed.XLAYER_CHAIN_ID &&
    hasLiveDeployment(bundledDeployment)
      ? bundledDeployment
      : undefined;
  const config = {
    environment: parsed.NODE_ENV,
    logLevel: parsed.LOG_LEVEL,
    provider: parsed.AGENT_PROVIDER,
    model: parsed.AGENT_MODEL,
    temperature: parsed.AGENT_TEMPERATURE,
    deepseek: {
      apiKey: parsed.DEEPSEEK_API_KEY,
      baseUrl: parsed.DEEPSEEK_BASE_URL,
    },
    modal: {
      apiKey: parsed.MODAL_API_KEY,
      baseUrl: parsed.MODAL_BASE_URL,
    },
    ollama: { baseUrl: parsed.OLLAMA_BASE_URL },
    chain: {
      mode: parsed.CHAIN_MODE,
      chainId: parsed.XLAYER_CHAIN_ID as 31_337 | 1_952 | 196,
      rpcUrl: parsed.XLAYER_RPC_URL,
      privateKey: parsed.AGENT_PRIVATE_KEY,
      vault: parsed.VAULT_ADDRESS || synchronizedDeployment?.vault || "",
      policy: parsed.POLICY_ADDRESS || synchronizedDeployment?.policy || "",
      registry: parsed.REGISTRY_ADDRESS || synchronizedDeployment?.registry || "",
      adapters: {
        rwa:
          parsed.RWA_ADAPTER_ADDRESS ||
          synchronizedDeployment?.adapters.rwa ||
          "",
        lending:
          parsed.LENDING_ADAPTER_ADDRESS ||
          synchronizedDeployment?.adapters.lending ||
          "",
        idle:
          parsed.IDLE_ADAPTER_ADDRESS ||
          synchronizedDeployment?.adapters.idle ||
          "",
      },
    },
    ipfs: {
      provider: parsed.IPFS_PROVIDER,
      localDirectory: resolve(cwd, parsed.IPFS_LOCAL_DIRECTORY),
      pinataJwt: parsed.PINATA_JWT,
    },
    corpusManifest: resolve(cwd, parsed.CORPUS_MANIFEST),
    sourceCacheDirectory: resolve(cwd, parsed.SOURCE_CACHE_DIRECTORY),
    diagnostics: {
      provider: parsed.DIAGNOSTICS_PROVIDER,
      sqlitePath: resolve(cwd, parsed.DIAGNOSTICS_SQLITE_PATH),
    },
    cron: parsed.AGENT_CRON,
    runOnStart: parsed.AGENT_RUN_ON_START,
    okx: {
      apiKey: parsed.OKX_API_KEY,
      secretKey: parsed.OKX_SECRET_KEY,
      passphrase: parsed.OKX_PASSPHRASE,
      tokenAddress: parsed.OKX_RWA_TOKEN_ADDRESS,
      quoteTokenAddress: parsed.OKX_QUOTE_TOKEN_ADDRESS,
      amount: parsed.OKX_QUOTE_AMOUNT,
      notionalUsd: parsed.OKX_QUOTE_NOTIONAL_USD,
    },
  } as const;

  if (config.provider === "deepseek" && !config.deepseek.apiKey) {
    throw new Error(
      "DEEPSEEK_API_KEY is required when AGENT_PROVIDER=deepseek.",
    );
  }
  if (
    config.provider === "modal" &&
    (!config.modal.apiKey || !config.modal.baseUrl)
  ) {
    throw new Error("MODAL_API_KEY and MODAL_BASE_URL are required for Modal.");
  }
  if (config.chain.mode === "live") {
    const values = [
      config.chain.privateKey,
      config.chain.vault,
      config.chain.policy,
      config.chain.registry,
      ...Object.values(config.chain.adapters),
    ];
    if (values.some((value) => !value)) {
      throw new Error(
        "Live chain mode requires the agent key and every contract address.",
      );
    }
  }
  if (config.ipfs.provider === "pinata" && !config.ipfs.pinataJwt) {
    throw new Error("PINATA_JWT is required when IPFS_PROVIDER=pinata.");
  }

  return config;
}
