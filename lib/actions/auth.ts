"use server";

import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { clearSessionCookie, signSessionCookie } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/User";

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

  try {
    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    const passwordHash = hashPassword(password);
    const user = await User.create({
      email,
      passwordHash,
      role: "user",
    });

    const userId = user._id ? user._id.toString() : user.id;
    await signSessionCookie({
      id: userId,
      email: user.email,
      role: user.role,
    });
  } catch (e) {
    console.error("Registration error:", e);
    return { error: "Failed to create account." };
  }

  // redirect must be called OUTSIDE try/catch
  redirect("/account");
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = validateEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));
  const rememberMe = formData.get("rememberMe") === "on";

  if (!email) return { error: "Enter a valid email address." };
  if (!password) return { error: "Enter your password." };

  let role: string;

  try {
    await connectDB();

    const user = await User.findOne({ email });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return { error: "Invalid email or password." };
    }
    if (!user._id) throw new Error("User ID missing");

    role = user.role;

    await signSessionCookie({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      rememberMe,
    });
  } catch (e) {
    console.error("Login error:", e);
    return { error: "Login failed. Please try again." };
  }

  // redirect() must be called outside try/catch
  // next param takes priority (e.g. redirected from a protected page)
  redirect(next ?? (role === "admin" ? "/admin" : "/account"));
}
export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}
