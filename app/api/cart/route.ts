import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import cartService from "@/lib/services/cart.service";

const COOKIE_NAME = "parlour_session";

function getSecretKey(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (raw && raw.length >= 32) {
    return new TextEncoder().encode(raw);
  }
  if (process.env.NODE_ENV === "development") {
    return new TextEncoder().encode("dev-insecure-parlour-secret-min-32-chars!");
  }
  throw new Error("AUTH_SECRET is required");
}

async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.sub as string;
  } catch {
    return null;
  }
}

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromToken(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
          product: item.productId && typeof item.productId === 'object' ? {
            name: item.productId.name,
            price: item.productId.price,
            image: item.productId.image,
            stock: item.productId.stock,
          } : undefined,
        })),
      };
      return NextResponse.json(transformedCart);
    }
    
    return NextResponse.json(cart || { items: [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// GET /api/cart/count - Get cart item count
export async function HEAD(request: NextRequest) {
  const userId = await getUserIdFromToken(request);

  if (!userId) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const count = await cartService.getCartItemCount(userId);
    return NextResponse.json({ count });
  } catch (error: any) {
    return NextResponse.json({ count: 0 });
  }
}
