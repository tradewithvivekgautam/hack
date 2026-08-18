import type { Metadata } from "next";
import { SourcesScreen } from "@/features/sources/components/sources-screen";

export const metadata: Metadata = { title: "Data sources" };
export default function SourcesPage() { return <SourcesScreen />; }
