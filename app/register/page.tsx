import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Register from "@/components/modules/auth/register";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Create account",
  description: "Register for Lumière Parlour.",
};

export default async function RegisterRoutePage() {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  return <Register />;
}
