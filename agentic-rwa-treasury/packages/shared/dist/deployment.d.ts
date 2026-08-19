import { type Address } from "viem";
import { z } from "zod";
export declare const DeploymentSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<"1.0.0">;
    chainId: z.ZodNumber;
    deployedAt: z.ZodString;
    deploymentBlock: z.ZodString;
    deployer: z.ZodPipe<z.ZodString & z.ZodType<`0x${string}`, string, z.core.$ZodTypeInternals<`0x${string}`, string>>, z.ZodTransform<`0x${string}`, `0x${string}`>>;
    admin: z.ZodPipe<z.ZodString & z.ZodType<`0x${string}`, string, z.core.$ZodTypeInternals<`0x${string}`, string>>, z.ZodTransform<`0x${string}`, `0x${string}`>>;
    agent: z.ZodPipe<z.ZodString & z.ZodType<`0x${string}`, string, z.core.$ZodTypeInternals<`0x${string}`, string>>, z.ZodTransform<`0x${string}`, `0x${string}`>>;
    asset: z.ZodPipe<z.ZodString & z.ZodType<`0x${string}`, string, z.core.$ZodTypeInternals<`0x${string}`, string>>, z.ZodTransform<`0x${string}`, `0x${string}`>>;
    policy: z.ZodPipe<z.ZodString & z.ZodType<`0x${string}`, string, z.core.$ZodTypeInternals<`0x${string}`, string>>, z.ZodTransform<`0x${string}`, `0x${string}`>>;
    registry: z.ZodPipe<z.ZodString & z.ZodType<`0x${string}`, string, z.core.$ZodTypeInternals<`0x${string}`, string>>, z.ZodTransform<`0x${string}`, `0x${string}`>>;
    vault: z.ZodPipe<z.ZodString & z.ZodType<`0x${string}`, string, z.core.$ZodTypeInternals<`0x${string}`, string>>, z.ZodTransform<`0x${string}`, `0x${string}`>>;
    adapters: z.ZodObject<{
        rwa: z.ZodPipe<z.ZodString & z.ZodType<`0x${string}`, string, z.core.$ZodTypeInternals<`0x${string}`, string>>, z.ZodTransform<`0x${string}`, `0x${string}`>>;
        lending: z.ZodPipe<z.ZodString & z.ZodType<`0x${string}`, string, z.core.$ZodTypeInternals<`0x${string}`, string>>, z.ZodTransform<`0x${string}`, `0x${string}`>>;
        idle: z.ZodPipe<z.ZodString & z.ZodType<`0x${string}`, string, z.core.$ZodTypeInternals<`0x${string}`, string>>, z.ZodTransform<`0x${string}`, `0x${string}`>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type Deployment = z.infer<typeof DeploymentSchema>;
export declare const bundledDeployment: {
    schemaVersion: "1.0.0";
    chainId: number;
    deployedAt: string;
    deploymentBlock: string;
    deployer: `0x${string}`;
    admin: `0x${string}`;
    agent: `0x${string}`;
    asset: `0x${string}`;
    policy: `0x${string}`;
    registry: `0x${string}`;
    vault: `0x${string}`;
    adapters: {
        rwa: `0x${string}`;
        lending: `0x${string}`;
        idle: `0x${string}`;
    };
};
export declare function hasLiveDeployment(deployment?: Deployment): boolean;
export declare function addressOrThrow(value: string | undefined, label: string): Address;
//# sourceMappingURL=deployment.d.ts.map