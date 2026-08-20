import { DeploymentSchema, type SupportedChainId } from "@agentic-rwa/shared";
import { isAddress, zeroAddress, type Address } from "viem";
import { z } from "zod";
import generatedDeploymentJson from "./generated-deployment.json" with { type: "json" };

const generatedDeployment = DeploymentSchema.parse(generatedDeploymentJson);

const OptionalAddressSchema = z
  .string()
  .default("")
  .transform(
    (value): Address => (value && isAddress(value) ? value : zeroAddress),
  );

const OptionalUrlSchema = z
  .string()
  .default("")
  .transform((value) => (value && URL.canParse(value) ? value : undefined));

const WalletConnectProjectIdSchema = z
  .string()
  .regex(/^[a-f0-9]{32}$/i, "WalletConnect project ID must be 32 hexadecimal characters");

const publicEnvironmentShape = {
  NEXT_PUBLIC_DEFAULT_CHAIN_ID: z.coerce
    .number()
    .int()
    .refine(
      (value) => value === 31_337 || value === 1_952 || value === 196,
      "Chain ID must be 31337, 1952, or 196",
    )
    .default(1_952),
  NEXT_PUBLIC_LOCAL_RPC_URL: z
    .string()
    .url()
    .default("http://127.0.0.1:8545"),
  NEXT_PUBLIC_XLAYER_TESTNET_RPC_URL: z
    .string()
    .url()
    .default("https://testrpc.xlayer.tech/terigon"),
  NEXT_PUBLIC_XLAYER_MAINNET_RPC_URL: z
    .string()
    .url()
    .default("https://rpc.xlayer.tech"),
  NEXT_PUBLIC_IPFS_GATEWAY_URL: z
    .string()
    .url()
    .default("https://ipfs.io/ipfs"),
  NEXT_PUBLIC_REPOSITORY_URL: OptionalUrlSchema,
  NEXT_PUBLIC_ASSET_ADDRESS: OptionalAddressSchema,
  NEXT_PUBLIC_POLICY_ADDRESS: OptionalAddressSchema,
  NEXT_PUBLIC_REGISTRY_ADDRESS: OptionalAddressSchema,
  NEXT_PUBLIC_VAULT_ADDRESS: OptionalAddressSchema,
  NEXT_PUBLIC_RWA_ADAPTER_ADDRESS: OptionalAddressSchema,
  NEXT_PUBLIC_LENDING_ADAPTER_ADDRESS: OptionalAddressSchema,
  NEXT_PUBLIC_IDLE_ADAPTER_ADDRESS: OptionalAddressSchema,
} as const;

const PublicEnvironmentSchema = z.discriminatedUnion("NEXT_PUBLIC_APP_MODE", [
  z
    .object({
      ...publicEnvironmentShape,
      NEXT_PUBLIC_APP_MODE: z.literal("demo"),
      NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
        WalletConnectProjectIdSchema.optional().default(""),
    })
    .strict(),
  z
    .object({
      ...publicEnvironmentShape,
      NEXT_PUBLIC_APP_MODE: z.literal("live"),
      NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: WalletConnectProjectIdSchema,
    })
    .strict(),
]);

// Literal reads allow Next.js to inline NEXT_PUBLIC_* values into client bundles.
const parsed = PublicEnvironmentSchema.parse({
  NEXT_PUBLIC_APP_MODE: process.env["NEXT_PUBLIC_APP_MODE"] ?? "demo",
  NEXT_PUBLIC_DEFAULT_CHAIN_ID: process.env["NEXT_PUBLIC_DEFAULT_CHAIN_ID"],
  NEXT_PUBLIC_LOCAL_RPC_URL: process.env["NEXT_PUBLIC_LOCAL_RPC_URL"],
  NEXT_PUBLIC_XLAYER_TESTNET_RPC_URL:
    process.env["NEXT_PUBLIC_XLAYER_TESTNET_RPC_URL"],
  NEXT_PUBLIC_XLAYER_MAINNET_RPC_URL:
    process.env["NEXT_PUBLIC_XLAYER_MAINNET_RPC_URL"],
  NEXT_PUBLIC_IPFS_GATEWAY_URL: process.env["NEXT_PUBLIC_IPFS_GATEWAY_URL"],
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
    process.env["NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"],
  NEXT_PUBLIC_REPOSITORY_URL: process.env["NEXT_PUBLIC_REPOSITORY_URL"],
  NEXT_PUBLIC_ASSET_ADDRESS:
    process.env["NEXT_PUBLIC_ASSET_ADDRESS"] ?? generatedDeployment.asset,
  NEXT_PUBLIC_POLICY_ADDRESS:
    process.env["NEXT_PUBLIC_POLICY_ADDRESS"] ?? generatedDeployment.policy,
  NEXT_PUBLIC_REGISTRY_ADDRESS:
    process.env["NEXT_PUBLIC_REGISTRY_ADDRESS"] ?? generatedDeployment.registry,
  NEXT_PUBLIC_VAULT_ADDRESS:
    process.env["NEXT_PUBLIC_VAULT_ADDRESS"] ?? generatedDeployment.vault,
  NEXT_PUBLIC_RWA_ADAPTER_ADDRESS:
    process.env["NEXT_PUBLIC_RWA_ADAPTER_ADDRESS"] ??
    generatedDeployment.adapters.rwa,
  NEXT_PUBLIC_LENDING_ADAPTER_ADDRESS:
    process.env["NEXT_PUBLIC_LENDING_ADAPTER_ADDRESS"] ??
    generatedDeployment.adapters.lending,
  NEXT_PUBLIC_IDLE_ADAPTER_ADDRESS:
    process.env["NEXT_PUBLIC_IDLE_ADAPTER_ADDRESS"] ??
    generatedDeployment.adapters.idle,
});

const hasAnyAddressOverride = Boolean(
  process.env["NEXT_PUBLIC_ASSET_ADDRESS"] ||
  process.env["NEXT_PUBLIC_POLICY_ADDRESS"] ||
  process.env["NEXT_PUBLIC_REGISTRY_ADDRESS"] ||
  process.env["NEXT_PUBLIC_VAULT_ADDRESS"] ||
  process.env["NEXT_PUBLIC_RWA_ADAPTER_ADDRESS"] ||
  process.env["NEXT_PUBLIC_LENDING_ADAPTER_ADDRESS"] ||
  process.env["NEXT_PUBLIC_IDLE_ADAPTER_ADDRESS"],
);

const contracts = {
  asset: parsed.NEXT_PUBLIC_ASSET_ADDRESS,
  policy: parsed.NEXT_PUBLIC_POLICY_ADDRESS,
  registry: parsed.NEXT_PUBLIC_REGISTRY_ADDRESS,
  vault: parsed.NEXT_PUBLIC_VAULT_ADDRESS,
  rwaAdapter: parsed.NEXT_PUBLIC_RWA_ADAPTER_ADDRESS,
  lendingAdapter: parsed.NEXT_PUBLIC_LENDING_ADAPTER_ADDRESS,
  idleAdapter: parsed.NEXT_PUBLIC_IDLE_ADAPTER_ADDRESS,
} as const;

export const webEnv = {
  appMode: parsed.NEXT_PUBLIC_APP_MODE,
  defaultChainId: parsed.NEXT_PUBLIC_DEFAULT_CHAIN_ID as SupportedChainId,
  localRpcUrl: parsed.NEXT_PUBLIC_LOCAL_RPC_URL,
  testnetRpcUrl: parsed.NEXT_PUBLIC_XLAYER_TESTNET_RPC_URL,
  mainnetRpcUrl: parsed.NEXT_PUBLIC_XLAYER_MAINNET_RPC_URL,
  ipfsGatewayUrl: parsed.NEXT_PUBLIC_IPFS_GATEWAY_URL,
  walletConnectProjectId:
    parsed.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || undefined,
  walletConnectConfigured: Boolean(parsed.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID),
  repositoryUrl: parsed.NEXT_PUBLIC_REPOSITORY_URL,
  contracts,
  contractsConfigured: Object.values(contracts).every(
    (contractAddress) => contractAddress !== zeroAddress,
  ),
} as const;

export function assertLiveConfiguration(): void {
  if (webEnv.appMode !== "live") return;
  if (!webEnv.contractsConfigured) {
    throw new Error(
      "Live mode requires every contract address. Deploy, run npm run deployment:sync, or provide NEXT_PUBLIC_* address overrides.",
    );
  }
  if (
    !hasAnyAddressOverride &&
    generatedDeployment.chainId !== webEnv.defaultChainId
  ) {
    throw new Error(
      `The synchronized deployment targets chain ${generatedDeployment.chainId}, but the web app targets ${webEnv.defaultChainId}. Run deployment:sync for the selected chain or provide explicit address overrides.`,
    );
  }
}
