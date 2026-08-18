"use client";

import { createContext, use, useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { keccak256, parseUnits, stringToBytes, type Hex } from "viem";

export type DemoTreasuryState = {
  connected: boolean;
  address: `0x${string}`;
  walletAssets: bigint;
  shares: bigint;
  totalAssets: bigint;
  totalSupply: bigint;
  version: number;
};

export type DemoTransactionResult = { hash: Hex; amount: bigint };

type DemoTreasuryContextValue = DemoTreasuryState & {
  connect(): void;
  disconnect(): void;
  faucet(): Promise<DemoTransactionResult>;
  deposit(assets: bigint): Promise<DemoTransactionResult>;
  withdraw(assets: bigint): Promise<DemoTransactionResult>;
  reset(): void;
};

const demoAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" as const;
const initialState: DemoTreasuryState = {
  connected: false,
  address: demoAddress,
  walletAssets: parseUnits("100000", 6),
  shares: parseUnits("12480", 6),
  totalAssets: parseUnits("4859700", 6),
  totalSupply: parseUnits("4610000", 6),
  version: 0,
};
const Context = createContext<DemoTreasuryContextValue | null>(null);

function delay(milliseconds = 450) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}

function transactionHash(label: string, version: number): Hex {
  return keccak256(stringToBytes(`agentic-rwa:${label}:${version}:${Date.now()}`));
}

export function DemoTreasuryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoTreasuryState>(initialState);
  const stateRef = useRef(state);
  const queueRef = useRef<Promise<unknown>>(Promise.resolve());
  stateRef.current = state;

  const update = useCallback(
    <T,>(operation: (current: DemoTreasuryState) => { state: DemoTreasuryState; result: T }): Promise<T> => {
      const queued = queueRef.current.then(async () => {
        await delay();
        const output = operation(stateRef.current);
        stateRef.current = output.state;
        setState(output.state);
        return output.result;
      });
      queueRef.current = queued.catch(() => undefined);
      return queued;
    },
    [],
  );

  const setConnection = useCallback((connected: boolean) => {
    setState((current) => {
      const next = {
        ...current,
        connected,
        version: current.version + 1,
      };
      stateRef.current = next;
      return next;
    });
  }, []);

  const connect = useCallback(() => setConnection(true), [setConnection]);
  const disconnect = useCallback(() => setConnection(false), [setConnection]);

  const faucet = useCallback(
    () =>
      update((current) => {
        const amount = parseUnits("10000", 6);
        const next = {
          ...current,
          walletAssets: current.walletAssets + amount,
          version: current.version + 1,
        };
        return {
          state: next,
          result: { hash: transactionHash("faucet", next.version), amount },
        };
      }),
    [update],
  );

  const deposit = useCallback(
    (assets: bigint) =>
      update((current) => {
        if (!current.connected) throw new Error("Connect the demo wallet first.");
        if (assets <= 0n) throw new Error("Deposit amount must be greater than zero.");
        if (assets > current.walletAssets) throw new Error("The deposit amount exceeds the wallet balance.");
        const shares =
          current.totalAssets === 0n || current.totalSupply === 0n
            ? assets
            : (assets * current.totalSupply) / current.totalAssets;
        const next = {
          ...current,
          walletAssets: current.walletAssets - assets,
          shares: current.shares + shares,
          totalAssets: current.totalAssets + assets,
          totalSupply: current.totalSupply + shares,
          version: current.version + 1,
        };
        return {
          state: next,
          result: { hash: transactionHash("deposit", next.version), amount: assets },
        };
      }),
    [update],
  );

  const withdraw = useCallback(
    (assets: bigint) =>
      update((current) => {
        if (!current.connected) throw new Error("Connect the demo wallet first.");
        if (assets <= 0n) throw new Error("Withdrawal amount must be greater than zero.");
        const ownedAssets =
          current.totalSupply === 0n ? 0n : (current.shares * current.totalAssets) / current.totalSupply;
        if (assets > ownedAssets) throw new Error("The withdrawal exceeds the vault position.");
        const shares =
          current.totalAssets === 0n
            ? 0n
            : (assets * current.totalSupply + current.totalAssets - 1n) / current.totalAssets;
        const next = {
          ...current,
          walletAssets: current.walletAssets + assets,
          shares: current.shares - shares,
          totalAssets: current.totalAssets - assets,
          totalSupply: current.totalSupply - shares,
          version: current.version + 1,
        };
        return {
          state: next,
          result: { hash: transactionHash("withdraw", next.version), amount: assets },
        };
      }),
    [update],
  );

  const reset = useCallback(() => {
    stateRef.current = initialState;
    setState(initialState);
  }, []);

  const value = useMemo<DemoTreasuryContextValue>(
    () => ({ ...state, connect, disconnect, faucet, deposit, withdraw, reset }),
    [state, connect, disconnect, faucet, deposit, withdraw, reset],
  );

  return <Context value={value}>{children}</Context>;
}

export function useDemoTreasury(): DemoTreasuryContextValue {
  const value = use(Context);
  if (!value) throw new Error("useDemoTreasury must be used inside DemoTreasuryProvider.");
  return value;
}
