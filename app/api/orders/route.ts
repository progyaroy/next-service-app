import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { successResponse, errorResponse, withErrorHandling } from "@/lib/api/response";
import { AuthenticationError } from "@/lib/errors/AppError";
import orderService from "@/lib/services/order.service";

const COOKIE_NAME = "parlour_session";

function getSecretKey(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (raw && raw.length >= 32) {
    return new TextEncoder().encode(raw);
  }
  if (process.env.NODE_ENV === "development") {
    return new TextEncoder().encode("dev-insecure-parlour-secret-min-32-chars!");
  }
  throw new Error("AUTH_SECRET is required in production");
}

async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.sub as string;
  } catch (error) {
    console.error("[Orders API] Token verification failed:", error);
    return null;
  }
}

/**
 * GET /api/orders
 * Get user's orders
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = await getUserIdFromToken(request);

  if (!userId) {
    throw new AuthenticationError("Session expired or invalid");
  }

  const orders = await orderService.getUserOrders(userId);

  return successResponse({
    orders,
    count: orders.length,
  });
});
