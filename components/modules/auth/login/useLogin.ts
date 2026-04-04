"use client";

import { useActionState } from "react";
import { loginAction, type AuthFormState } from "@/lib/actions/auth";

const initial: AuthFormState = {};

export function useLogin() {
  return useActionState(loginAction, initial);
}
