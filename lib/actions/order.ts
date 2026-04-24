"use server";

import { getCurrentUser } from "@/lib/auth/session";
import orderService from "@/lib/services/order.service";
import cartService from "@/lib/services/cart.service";

export type OrderActionState = {
  error?: string;
  success?: boolean;
  orderId?: string;
};

/**
 * Place an order from the current cart
 */
export async function placeOrderAction(): Promise<OrderActionState> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    // Get user's cart
    const cart = await cartService.getCart(user.id);

    if (!cart || cart.items.length === 0) {
      return { error: "Cart is empty" };
    }

    // Create order from cart
    const order = await orderService.createOrderFromCart(user.id);

    // Clear cart after successful order
    await cartService.clearCart(user.id);

    return {
      success: true,
      orderId: order._id.toString(),
    };
  } catch (error: any) {
    console.error("[Order Action] Error placing order:", error);
    return { error: error.message || "Failed to place order" };
  }
}

/**
 * Get user's orders
 */
export async function getUserOrdersAction(): Promise<{
  orders: any[];
  error?: string;
}> {
  const user = await getCurrentUser();

  if (!user) {
    return { orders: [], error: "Not authenticated" };
  }

  try {
    const orders = await orderService.getUserOrders(user.id);
    return { orders };
  } catch (error: any) {
    console.error("[Order Action] Error fetching orders:", error);
    return { orders: [], error: error.message || "Failed to fetch orders" };
  }
}

/**
 * Get all orders (admin only)
 */
export async function getAllOrdersAction(): Promise<{
  orders: any[];
  error?: string;
}> {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return { orders: [], error: "Unauthorized" };
  }

  try {
    const orders = await orderService.getAllOrders();
    return { orders };
  } catch (error: any) {
    console.error("[Order Action] Error fetching all orders:", error);
    return { orders: [], error: error.message || "Failed to fetch orders" };
  }
}

/**
 * Cancel an order
 */
export async function cancelOrderAction(
  orderId: string
): Promise<OrderActionState> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    await orderService.cancelOrder(orderId, user.id);
    return { success: true };
  } catch (error: any) {
    console.error("[Order Action] Error cancelling order:", error);
    return { error: error.message || "Failed to cancel order" };
  }
}
