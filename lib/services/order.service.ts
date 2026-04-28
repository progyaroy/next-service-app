import "server-only";

import { connectDB } from "@/lib/db/mongoose";
import { serialize } from "@/lib/db/serialize";
import Order, { IOrder, OrderStatus, IOrderItem } from "@/lib/models/Order";
import Cart from "@/lib/models/Cart";
import Product from "@/lib/models/Product";
import Service from "@/lib/models/Service";
import { NotFoundError, ValidationError } from "@/lib/errors/AppError";
import cartService from "@/lib/services/cart.service";
import type { Types } from "mongoose";

export type OrderDTO = Omit<IOrder, "toObject" | "save">;

class OrderService {
  /**
   * Create an order from user's cart
   */
  async createOrderFromCart(userId: string): Promise<OrderDTO> {
    await connectDB();

    // Get user's cart
    const cart = await Cart.findOne({ userId }).lean();

    if (!cart || cart.items.length === 0) {
      throw new ValidationError("Cart is empty", "EMPTY_CART");
    }

    // Prepare order items and validate stock
    const orderItems: IOrderItem[] = [];
    let totalAmount = 0;

    for (const cartItem of cart.items) {
      if (cartItem.itemType === "product") {
        const product = await Product.findById(cartItem.itemId);

        if (!product) {
          throw new NotFoundError("Product");
        }

        if (product.stock < cartItem.quantity) {
          throw new ValidationError(
            `Insufficient stock for ${product.name}`,
            "INSUFFICIENT_STOCK"
          );
        }

        const itemTotal = cartItem.snapshotPrice * cartItem.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          itemId: product._id as Types.ObjectId,
          itemType: "product",
          name: product.name,
          price: cartItem.snapshotPrice,
          quantity: cartItem.quantity,
          snapshotData: cartItem.snapshotData,
        });
      } else if (cartItem.itemType === "service") {
        const service = await Service.findById(cartItem.itemId);

        if (!service) {
          throw new NotFoundError("Service");
        }

        const itemTotal = cartItem.snapshotPrice * cartItem.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          itemId: service._id as Types.ObjectId,
          itemType: "service",
          name: service.name,
          price: cartItem.snapshotPrice,
          quantity: cartItem.quantity,
          snapshotData: cartItem.snapshotData,
        });
      }
    }

    // Generate random stripe payment intent ID (no actual payment)
    const randomStripeId = `pi_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    // Create order
    const order = await Order.create({
      userId,
      items: orderItems,
      totalAmount,
      status: "completed",
      stripePaymentIntentId: randomStripeId,
    });

    // Clear the cart after successful order creation
    await cartService.clearCart(userId);

    return serialize(order.toObject() as OrderDTO);
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string, userId: string): Promise<OrderDTO | null> {
    await connectDB();

    const order = await Order.findOne({
      _id: orderId,
      userId,
    }).lean();

    return serialize(order as OrderDTO | null);
  }

  /**
   * Get user's orders
   */
  async getUserOrders(userId: string, limit: number = 50): Promise<OrderDTO[]> {
    await connectDB();

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return serialize(orders as OrderDTO[]);
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(limit: number = 100): Promise<OrderDTO[]> {
    await connectDB();

    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return serialize(orders as OrderDTO[]);
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    userId: string
  ): Promise<OrderDTO> {
    await connectDB();

    const order = await Order.findOneAndUpdate(
      { _id: orderId, userId },
      { status },
      { new: true }
    ).lean();

    if (!order) {
      throw new NotFoundError("Order");
    }

    return serialize(order as OrderDTO);
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, userId: string): Promise<OrderDTO> {
    await connectDB();

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      throw new NotFoundError("Order");
    }

    if (order.status === "completed") {
      throw new ValidationError(
        "Cannot cancel a completed order",
        "ORDER_ALREADY_COMPLETED"
      );
    }

    order.status = "cancelled";
    await order.save();

    return serialize(order.toObject() as OrderDTO);
  }
}

export default new OrderService();
