import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginScreen } from "@/components/auth/login-screen";
import { getSafeNextPath } from "@/lib/auth/safe-next-path";
import Loading from "./loading";

export const metadata: Metadata = { title: "Connect wallet" };

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const nextParam = params["next"];
  const nextValue = Array.isArray(nextParam) ? nextParam[0] : nextParam;

  return (
    <Suspense fallback={<Loading />}>
      <LoginScreen nextPath={getSafeNextPath(nextValue)} />
    </Suspense>
  );
}
