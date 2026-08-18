import {
  allocationToTuple,
  chainById,
  policyAbi,
  registryAbi,
  STRATEGY_IDS,
  strategyAdapterAbi,
  tupleToAllocation,
  vaultAbi,
  type AllocationWeights,
  type MarketSnapshot,
} from "@agentic-rwa/shared";
import {
  createPublicClient,
  createWalletClient,
  getAddress,
  http,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { AgentConfig } from "../config/env.js";
import type {
  ChainDecision,
  ChainGateway,
  ChainSnapshot,
} from "../domain/ports.js";


export class ViemChainGateway implements ChainGateway {
  private readonly account;
  private readonly publicClient;
  private readonly walletClient;
  private readonly chain;
  private readonly addresses;

  constructor(config: AgentConfig["chain"]) {
    this.chain = chainById(config.chainId);
    this.account = privateKeyToAccount(config.privateKey as Hex);
    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(config.rpcUrl),
    });
    this.walletClient = createWalletClient({
      account: this.account,
      chain: this.chain,
      transport: http(config.rpcUrl),
    });
    this.addresses = {
      vault: getAddress(config.vault),
      policy: getAddress(config.policy),
      registry: getAddress(config.registry),
      adapters: {
        rwa: getAddress(config.adapters.rwa),
        lending: getAddress(config.adapters.lending),
        idle: getAddress(config.adapters.idle),
      },
    };
  }

  async snapshot(): Promise<ChainSnapshot> {
    const [
      totalAssets,
      weightsTuple,
      lastRebalanceAt,
      maxWeightBps,
      maxTurnoverBps,
      cooldownSeconds,
      epoch,
    ] = await Promise.all([
      this.publicClient.readContract({
        address: this.addresses.vault,
        abi: vaultAbi,
        functionName: "totalAssets",
      }),
      this.publicClient.readContract({
        address: this.addresses.vault,
        abi: vaultAbi,
        functionName: "currentWeights",
      }),
      this.publicClient.readContract({
        address: this.addresses.vault,
        abi: vaultAbi,
        functionName: "lastRebalanceAt",
      }),
      this.publicClient.readContract({
        address: this.addresses.policy,
        abi: policyAbi,
        functionName: "maxWeightBps",
      }),
      this.publicClient.readContract({
        address: this.addresses.policy,
        abi: policyAbi,
        functionName: "maxTurnoverBps",
      }),
      this.publicClient.readContract({
        address: this.addresses.policy,
        abi: policyAbi,
        functionName: "cooldownSeconds",
      }),
      this.publicClient.readContract({
        address: this.addresses.registry,
        abi: registryAbi,
        functionName: "epoch",
      }),
    ]);

    const adapterEntries = STRATEGY_IDS.map(
      (strategyId) => [strategyId, this.addresses.adapters[strategyId]] as const,
    );
    const adapterRows = await Promise.all(
      adapterEntries.map(async ([strategyId, address]) => {
        const [assets, apyBps] = await Promise.all([
          this.publicClient.readContract({
            address,
            abi: strategyAdapterAbi,
            functionName: "totalAssets",
          }),
          this.publicClient.readContract({
            address,
            abi: strategyAdapterAbi,
            functionName: "apyBps",
          }),
        ]);
        return {
          strategyId,
          assets: assets.toString(),
          apyBps: Number(apyBps),
        };
      }),
    );

    const recentDecisions: ChainDecision[] = [];
    const firstEpoch = epoch > 5n ? epoch - 4n : 1n;
    for (
      let decisionEpoch = firstEpoch;
      decisionEpoch <= epoch;
      decisionEpoch += 1n
    ) {
      const decision = await this.publicClient.readContract({
        address: this.addresses.registry,
        abi: registryAbi,
        functionName: "decision",
        args: [decisionEpoch],
      });
      recentDecisions.push({
        epoch: Number(decisionEpoch),
        timestamp: Number(decision.timestamp),
        weights: tupleToAllocation([
          Number(decision.weights[0]),
          Number(decision.weights[1]),
          Number(decision.weights[2]),
        ]),
        reasoningHash: decision.reasoningHash,
        reasoningCid: decision.reasoningCid,
        agent: decision.agent,
        totalAssets: decision.totalAssets,
      });
    }

    const market: MarketSnapshot = {
      totalAssets: totalAssets.toString(),
      adapters: adapterRows,
      okxExitLiquidity: {
        available: false,
        notionalUsd: 0,
        estimatedPriceImpactBps: 0,
        observedAt: new Date().toISOString(),
      },
    };

    return {
      chainId: this.chain.id,
      vault: this.addresses.vault,
      totalAssets,
      currentWeights: tupleToAllocation([
        Number(weightsTuple[0]),
        Number(weightsTuple[1]),
        Number(weightsTuple[2]),
      ]),
      lastRebalanceAt: Number(lastRebalanceAt),
      policy: {
        maxWeightBps: Number(maxWeightBps),
        maxTurnoverBps: Number(maxTurnoverBps),
        cooldownSeconds: Number(cooldownSeconds),
      },
      market,
      recentDecisions,
    };
  }

  async simulateRebalance(
    weights: AllocationWeights,
    reasoningHash: Hex,
    reasoningCid: string,
  ): Promise<void> {
    await this.publicClient.simulateContract({
      account: this.account,
      address: this.addresses.vault,
      abi: vaultAbi,
      functionName: "rebalance",
      args: [allocationToTuple(weights), reasoningHash, reasoningCid],
    });
  }

  async submitRebalance(
    weights: AllocationWeights,
    reasoningHash: Hex,
    reasoningCid: string,
  ) {
    const simulation = await this.publicClient.simulateContract({
      account: this.account,
      address: this.addresses.vault,
      abi: vaultAbi,
      functionName: "rebalance",
      args: [allocationToTuple(weights), reasoningHash, reasoningCid],
    });
    const txHash = await this.walletClient.writeContract(simulation.request);
    await this.publicClient.waitForTransactionReceipt({
      hash: txHash,
      confirmations: 1,
    });
    const epoch = await this.publicClient.readContract({
      address: this.addresses.registry,
      abi: registryAbi,
      functionName: "epoch",
    });
    return { txHash, epoch: Number(epoch) };
  }
}
