import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Login from "@/components/modules/auth/login";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Lumière Parlour account.",
};

type Props = { searchParams: Promise<{ next?: string }> };

function safeNextPath(raw: string | undefined): string | undefined {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return undefined;
  return raw;
}

export default async function LoginRoutePage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  const { next: nextRaw } = await searchParams;
  const nextPath = safeNextPath(nextRaw);

  return <Login nextPath={nextPath} />;
}
