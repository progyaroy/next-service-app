"use client";

import { useActionState } from "react";
import { registerAction, type AuthFormState } from "@/lib/actions/auth";

const initial: AuthFormState = {};

export function useRegister() {
  return useActionState(registerAction, initial);
}
