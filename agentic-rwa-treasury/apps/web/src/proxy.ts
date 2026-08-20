import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSafeNextPath } from "@/lib/auth/safe-next-path";

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();

  if (url.pathname === "/connect") {
    url.pathname = "/login";
    if (!url.searchParams.has("next")) url.searchParams.set("next", "/vault");
    return NextResponse.redirect(url);
  }

  const requestedNext = url.searchParams.get("next");
  if (requestedNext && getSafeNextPath(requestedNext) !== requestedNext) {
    url.searchParams.set("next", getSafeNextPath(requestedNext));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/connect", "/login"] };
