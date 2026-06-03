import { NextRequest } from "next/server";
import { SignJWT } from "jose";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { getUserFromRequest } from "@/lib/api/auth";
import { AuthenticationError } from "@/lib/errors/AppError";

function getSecretKey(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (raw && raw.length >= 32) return new TextEncoder().encode(raw);
  if (process.env.NODE_ENV === "development") {
    return new TextEncoder().encode("dev-insecure-parlour-secret-min-32-chars!");
  }
  throw new Error("AUTH_SECRET is required in production (min 32 characters).");
}

// GET /api/chat/socket-token
export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await getUserFromRequest(req);
  if (!auth) throw new AuthenticationError();

  const token = await new SignJWT({ type: "chat_socket" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(auth.userId)
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(getSecretKey());

  return successResponse({ token, expiresIn: 600 });
});
