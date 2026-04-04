"use server";

import Database from "better-sqlite3";
import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { clearSessionCookie, signSessionCookie } from "@/lib/auth/session";
import { createUserRecord, findUserByEmail } from "@/lib/auth/user-repository";

export type AuthFormState = {
  error?: string;
};

function safeNextPath(raw: unknown): string | undefined {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) {
    return undefined;
  }
  return raw;
}

function validateEmail(email: string): string | null {
  const t = email.trim().toLowerCase();
  if (t.length < 3 || !t.includes("@") || !t.includes(".")) {
    return null;
  }
  return t;
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = validateEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!email) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  if (findUserByEmail(email)) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = hashPassword(password);
  try {
    const user = createUserRecord(email, passwordHash, "user");
    await signSessionCookie(user);
  } catch (e) {
    if (e instanceof Database.SqliteError && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return { error: "An account with this email already exists." };
    }
    throw e;
  }
  redirect("/account");
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = validateEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!email) {
    return { error: "Enter a valid email address." };
  }
  if (!password) {
    return { error: "Enter your password." };
  }

  const row = findUserByEmail(email);
  if (!row) {
    return { error: "Invalid email or password." };
  }

  const ok = verifyPassword(password, row.passwordHash);
  if (!ok) {
    return { error: "Invalid email or password." };
  }

  const { passwordHash: _, ...user } = row;
  await signSessionCookie(user);
  redirect(next ?? "/account");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}
