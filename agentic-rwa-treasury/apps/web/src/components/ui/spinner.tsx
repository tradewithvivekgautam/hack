import { LoaderCircle } from "lucide-react";
export function Spinner({ label = "Loading" }: { label?: string }) { return <span className="inline-flex items-center gap-2 text-xs text-muted"><LoaderCircle className="size-3.5 animate-spin" aria-hidden />{label}</span>; }
