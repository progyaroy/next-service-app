import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { User, UserRole } from "@/lib/auth/types";
import { findUserById } from "@/lib/auth/user-repository";

const COOKIE_NAME = "parlour_session";

function secretKey(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (raw && raw.length >= 32) {
    return new TextEncoder().encode(raw);
  }
  if (process.env.NODE_ENV === "development") {
    return new TextEncoder().encode("dev-insecure-parlour-secret-min-32-chars!");
  }
  throw new Error(
    "AUTH_SECRET is required in production (min 32 characters). Add it to .env.local."
  );
}

export async function signSessionCookie(user: {
  id: string;
  email: string;
  role: UserRole;
}): Promise<void> {
  const token = await new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

type JwtClaims = { sub: string; email: string; role: UserRole };

async function verifyJwt(token: string): Promise<JwtClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
    });
    const sub = payload.sub;
    const email = payload.email;
    const role = payload.role;
    if (typeof sub !== "string" || typeof email !== "string") return null;
    if (role !== "user" && role !== "admin") return null;
    return { sub, email, role };
  } catch {
    return null;
  }
}

/** Resolves the signed-in user from the httpOnly session cookie (no client storage). */
export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const claims = await verifyJwt(token);
  if (!claims) return null;

  const user = findUserById(claims.sub);
  if (!user || user.email !== claims.email) return null;
  return user;
}
