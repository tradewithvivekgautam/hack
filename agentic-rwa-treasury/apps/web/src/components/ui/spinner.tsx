import { LoaderCircle } from "lucide-react";
import { Typography } from "./typography";
export function Spinner({ label = "Loading" }: { label?: string }) { return <Typography as="span" className="inline-flex items-center gap-2 text-muted" variant="caption"><LoaderCircle className="size-3.5 animate-spin" aria-hidden />{label}</Typography>; }
