"use client";

import { Tooltip } from "@base-ui/react/tooltip";
import {
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/chain/config";
import { DemoTreasuryProvider } from "@/lib/demo/demo-treasury";

const rainbowTheme = lightTheme({
  accentColor: "#f98123",
  accentColorForeground: "#20201f",
  borderRadius: "medium",
  fontStack: "system",
  overlayBlur: "small",
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: { retry: 0 },
        },
      }),
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          showRecentTransactions
          theme={rainbowTheme}
        >
          <NuqsAdapter>
            <DemoTreasuryProvider>
              <Tooltip.Provider delay={300}>{children}</Tooltip.Provider>
              <Toaster closeButton position="bottom-right" richColors />
            </DemoTreasuryProvider>
          </NuqsAdapter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
