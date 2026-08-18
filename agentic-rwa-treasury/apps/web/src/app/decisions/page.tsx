import type { Metadata } from "next";
import { DecisionsScreen } from "@/features/decisions/components/decisions-screen";

export const metadata: Metadata = { title: "Decision log" };
export default function DecisionsPage() { return <DecisionsScreen />; }
