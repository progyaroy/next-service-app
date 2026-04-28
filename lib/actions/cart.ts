"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import cartService from "@/lib/services/cart.service";
import type { CartItemType } from "@/lib/models/Cart";

export type CartActionState = {
  error?: string;
  success?: boolean;
};

export async function addToCartAction(
  _prev: CartActionState,
  formData: FormData
): Promise<CartActionState> {
  const user = await getCurrentUser();

  const itemId = formData.get("itemId") as string;
  const itemType = (formData.get("itemType") as CartItemType) || "product";

  if (!user) {
    // Redirect to login with return URL
    const returnUrl = itemType === "service" ? `/services/${itemId}` : `/products/${itemId}`;
    redirect(`/login?next=${returnUrl}`);
  }

  const quantity = parseInt(formData.get("quantity") as string) || 1;

  if (!itemId) {
    return { error: "Item ID is required" };
  }

  try {
    await cartService.addToCart(user.id, itemId, itemType, quantity);
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

  const itemId = formData.get("itemId") as string;
  const itemType = (formData.get("itemType") as CartItemType) || "product";

  if (!itemId) {
    return { error: "Item ID is required" };
  }

  try {
    await cartService.removeFromCart(user.id, itemId, itemType);
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

  const itemId = formData.get("itemId") as string;
  const itemType = (formData.get("itemType") as CartItemType) || "product";
  const quantity = parseInt(formData.get("quantity") as string);

  if (!itemId || isNaN(quantity)) {
    return { error: "Invalid item ID or quantity" };
  }

  try {
    await cartService.updateQuantity(user.id, itemId, quantity, itemType);
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
