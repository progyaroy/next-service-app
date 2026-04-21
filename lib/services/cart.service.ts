import "server-only";

import { connectDB } from "@/lib/db/mongoose";
import { serialize } from "@/lib/db/serialize";
import Cart from "@/lib/models/Cart";
import Product from "@/lib/models/Product";
import type { ICart } from "@/lib/models/Cart";

export type CartDTO = Omit<ICart, "toObject" | "save">;

class CartService {
  async getCart(userId: string): Promise<CartDTO | null> {
    await connectDB();
    const cart = await Cart.findOne({ userId })
      .populate("items.productId", "name price image stock")
      .lean();
    return serialize(cart as CartDTO | null);
  }

  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartDTO> {
    await connectDB();

    // Verify product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    if (product.stock < quantity) {
      throw new Error("Insufficient stock");
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart
      cart = await Cart.create({
        userId,
        items: [{ productId, quantity, addedAt: new Date() }],
      });
    } else {
      // Check if product already in cart
      const existingItem = cart.items.find(
        (item: any) => item.productId.toString() === productId
      );

      if (existingItem) {
        // Allow adding same product again - increment quantity
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          productId: productId as any,
          quantity,
          addedAt: new Date(),
        });
      }

      await cart.save();
    }

    const updated = await Cart.findOne({ userId })
      .populate("items.productId", "name price image stock")
      .lean();

    return serialize(updated as CartDTO);
  }

  async removeFromCart(userId: string, productId: string): Promise<CartDTO | null> {
    await connectDB();

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return null;
    }

    cart.items = cart.items.filter(
      (item: any) => item.productId.toString() !== productId
    );

    if (cart.items.length === 0) {
      await Cart.deleteOne({ userId });
      return null;
    }

    await cart.save();

    const updated = await Cart.findOne({ userId })
      .populate("items.productId", "name price image stock")
      .lean();

    return serialize(updated as CartDTO);
  }

  async updateQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<CartDTO | null> {
    await connectDB();

    if (quantity < 1) {
      return this.removeFromCart(userId, productId);
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return null;
    }

    const item = cart.items.find(
      (item: any) => item.productId.toString() === productId
    );

    if (!item) {
      throw new Error("Product not in cart");
    }

    // Verify stock
    const product = await Product.findById(productId);
    if (!product || product.stock < quantity) {
      throw new Error("Insufficient stock");
    }

    item.quantity = quantity;
    await cart.save();

    const updated = await Cart.findOne({ userId })
      .populate("items.productId", "name price image stock")
      .lean();

    return serialize(updated as CartDTO);
  }

  async clearCart(userId: string): Promise<void> {
    await connectDB();
    await Cart.deleteOne({ userId });
  }

  async getCartItemCount(userId: string): Promise<number> {
    await connectDB();
    const cart = await Cart.findOne({ userId });
    if (!cart) return 0;
    return cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  }
}

export default new CartService();
