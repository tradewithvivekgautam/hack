import { getAddress, isAddress, zeroAddress, type Address } from "viem";
import { z } from "zod";
import deploymentJson from "./generated/deployment.json" with { type: "json" };

const AddressSchema = z
  .string()
  .refine(isAddress, "Expected an EVM address")
  .transform((address) => getAddress(address));

export const DeploymentSchema = z.object({
  schemaVersion: z.literal("1.0.0"),
  chainId: z.number().int().positive(),
  deployedAt: z.string(),
  deploymentBlock: z.string().regex(/^\d+$/),
  deployer: AddressSchema,
  admin: AddressSchema,
  agent: AddressSchema,
  asset: AddressSchema,
  policy: AddressSchema,
  registry: AddressSchema,
  vault: AddressSchema,
  adapters: z.object({ rwa: AddressSchema, lending: AddressSchema, idle: AddressSchema }).strict(),
}).strict();

export type Deployment = z.infer<typeof DeploymentSchema>;

export const bundledDeployment = DeploymentSchema.parse(deploymentJson);

export function hasLiveDeployment(deployment: Deployment = bundledDeployment): boolean {
  return deployment.vault !== zeroAddress;
}

export function addressOrThrow(value: string | undefined, label: string): Address {
  if (!value || !isAddress(value)) throw new Error(`${label} is missing or invalid.`);
  return getAddress(value);
}
