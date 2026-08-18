import type { Metadata } from "next";
import { ProtocolScreen } from "@/features/protocol/components/protocol-screen";

export const metadata: Metadata = { title: "Protocol" };
export default function ProtocolPage() { return <ProtocolScreen />; }
