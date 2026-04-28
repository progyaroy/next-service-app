import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "parlour_session";

export function getSecretKey(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (raw && raw.length >= 32) return new TextEncoder().encode(raw);
  if (process.env.NODE_ENV === "development")
    return new TextEncoder().encode("dev-insecure-parlour-secret-min-32-chars!");
  throw new Error("AUTH_SECRET is required in production (min 32 characters).");
}

export async function getUserFromRequest(
  request: NextRequest
): Promise<{ userId: string; role: string } | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const userId = payload.sub as string;
    const role = payload.role as string;
    if (!userId) return null;
    return { userId, role };
  } catch {
    return null;
  }
}
