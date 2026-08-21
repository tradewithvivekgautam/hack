import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";
import { AppFrame } from "@/components/auth/app-frame";
import { assertLiveConfiguration } from "@/config/env";
import "./globals.css";
import { Providers } from "./providers";

const geist = Geist({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist",
});

assertLiveConfiguration();

export const metadata: Metadata = {
  title: { default: "Arca — Agentic RWA Treasury", template: "%s · Arca" },
  description:
    "An AI portfolio manager for tokenized real-world assets, with every decision auditable on X Layer.",
  applicationName: "Arca",
  manifest: "/site.webmanifest",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: "#f9f9f8",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={geist.variable} lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AppFrame>{children}</AppFrame>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
