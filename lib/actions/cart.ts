"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import cartService from "@/lib/services/cart.service";

export type CartActionState = {
  error?: string;
  success?: boolean;
};

export async function addToCartAction(
  _prev: CartActionState,
  formData: FormData
): Promise<CartActionState> {
  const user = await getCurrentUser();

  if (!user) {
    // Redirect to login with return URL
    const productId = formData.get("productId") as string;
    redirect(`/login?next=/products/${productId}`);
  }

  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string) || 1;

  if (!productId) {
    return { error: "Product ID is required" };
  }

  try {
    await cartService.addToCart(user.id, productId, quantity);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to add to cart" };
  }
}

export async function removeFromCartAction(
  _prev: CartActionState,
  formData: FormData
): Promise<CartActionState> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const productId = formData.get("productId") as string;

  if (!productId) {
    return { error: "Product ID is required" };
  }

  try {
    await cartService.removeFromCart(user.id, productId);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to remove from cart" };
  }
}

export async function updateCartQuantityAction(
  _prev: CartActionState,
  formData: FormData
): Promise<CartActionState> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string);

  if (!productId || isNaN(quantity)) {
    return { error: "Invalid product ID or quantity" };
  }

  try {
    await cartService.updateQuantity(user.id, productId, quantity);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update cart" };
  }
}

export async function clearCartAction(): Promise<CartActionState> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    await cartService.clearCart(user.id);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to clear cart" };
  }
}
