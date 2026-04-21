import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import cartService from "@/lib/services/cart.service";
import { successResponse, errorResponse, withErrorHandling } from "@/lib/api/response";
import { AuthenticationError } from "@/lib/errors/AppError";

const COOKIE_NAME = "parlour_session";

function getSecretKey(): Uint8Array {
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

async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.sub as string;
  } catch (error) {
    console.error("[Cart API] Token verification failed:", error);
    return null;
  }
}

// GET /api/cart - Get user's cart
export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = await getUserIdFromToken(request);

  if (!userId) {
    throw new AuthenticationError("Session expired or invalid");
  }

  try {
    const cart = await cartService.getCart(userId);

    // Transform cart items to include product data
    if (cart && cart.items) {
      const transformedCart = {
        ...cart,
        items: cart.items.map((item: any) => ({
          productId: item.productId?._id || item.productId,
          quantity: item.quantity,
          addedAt: item.addedAt,
          product:
            item.productId && typeof item.productId === "object"
              ? {
                  name: item.productId.name,
                  price: item.productId.price,
                  image: item.productId.image,
                  stock: item.productId.stock,
                }
              : undefined,
        })),
      };
      return successResponse(transformedCart);
    }

    return successResponse({ items: [] });
  } catch (error) {
    console.error("[Cart API] Error fetching cart:", error);
    throw error;
  }
});

// HEAD /api/cart/count - Get cart item count
export async function HEAD(request: NextRequest) {
  const userId = await getUserIdFromToken(request);

  if (!userId) {
    return successResponse({ count: 0 });
  }

  try {
    const count = await cartService.getCartItemCount(userId);
    return successResponse({ count });
  } catch (error) {
    console.error("[Cart API] Error fetching cart count:", error);
    return successResponse({ count: 0 });
  }
}
