"use client";

import { useSearchParams } from "next/navigation";
import Login from "@/components/modules/auth/login";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");

  return <Login nextPath={nextPath || undefined} />;
}
