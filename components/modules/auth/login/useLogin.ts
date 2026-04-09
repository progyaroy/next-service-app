"use client";

import { useActionState } from "react";
import { loginAction, type AuthFormState } from "@/lib/actions/auth";

const initial: AuthFormState = {};

export function useLogin() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return [state, formAction, pending] as const;
}