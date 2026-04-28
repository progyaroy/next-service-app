import "server-only";

import { connectDB } from "@/lib/db/mongoose";
import { serialize } from "@/lib/db/serialize";
import Cart from "@/lib/models/Cart";
import Product from "@/lib/models/Product";
import Service from "@/lib/models/Service";
import type { ICart, CartItemType } from "@/lib/models/Cart";

export type CartDTO = Omit<ICart, "toObject" | "save">;

class CartService {
  async getCart(userId: string): Promise<CartDTO | null> {
    await connectDB();
    const cart = await Cart.findOne({ userId }).lean();
    return serialize(cart as CartDTO | null);
  }

  async addToCart(
    userId: string,
    itemId: string,
    itemType: CartItemType = "product",
    quantity: number = 1,
    snapshotPrice?: number
  ): Promise<CartDTO> {
    await connectDB();

    // Verify item exists and get snapshot price
    let item: any;
    let finalSnapshotPrice = snapshotPrice;

    if (itemType === "product") {
      item = await Product.findById(itemId);
      if (!item) {
        throw new Error("Product not found");
      }
      if (item.stock < quantity) {
        throw new Error("Insufficient stock");
      }
      finalSnapshotPrice = finalSnapshotPrice || item.price;
    } else if (itemType === "service") {
      item = await Service.findById(itemId).populate("includedProducts.productId", "name price");
      if (!item) {
        throw new Error("Service not found");
      }
      // Calculate total price for service
      let totalPrice = item.basePrice;
      if (item.includedProducts && item.includedProducts.length > 0) {
        totalPrice += item.includedProducts.reduce((sum: number, p: any) => {
          const product = p.productId;
          return sum + (product.price * (p.quantity || 1));
        }, 0);
      }
      finalSnapshotPrice = finalSnapshotPrice || totalPrice;
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart
      cart = await Cart.create({
        userId,
        items: [
          {
            itemId,
            itemType,
            quantity,
            snapshotPrice: finalSnapshotPrice,
            snapshotData: item.toObject ? item.toObject() : item,
            addedAt: new Date(),
          },
        ],
      });
    } else {
      // Check if item already in cart
      const existingItem = cart.items.find(
        (cartItem: any) =>
          cartItem.itemId.toString() === itemId && cartItem.itemType === itemType
      );

      if (existingItem) {
        // Increment quantity
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          itemId: itemId as any,
          itemType,
          quantity,
          snapshotPrice: finalSnapshotPrice,
          snapshotData: item.toObject ? item.toObject() : item,
          addedAt: new Date(),
        });
      }

      await cart.save();
    }

    const updated = await Cart.findOne({ userId }).lean();
    return serialize(updated as CartDTO);
  }

  async removeFromCart(userId: string, itemId: string, itemType: CartItemType = "product"): Promise<CartDTO | null> {
    await connectDB();

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return null;
    }

    cart.items = cart.items.filter(
      (item: any) => !(item.itemId.toString() === itemId && item.itemType === itemType)
    );

    if (cart.items.length === 0) {
      await Cart.deleteOne({ userId });
      return null;
    }

    await cart.save();

    const updated = await Cart.findOne({ userId }).lean();
    return serialize(updated as CartDTO);
  }

  async updateQuantity(
    userId: string,
    itemId: string,
    quantity: number,
    itemType: CartItemType = "product"
  ): Promise<CartDTO | null> {
    await connectDB();

    if (quantity < 1) {
      return this.removeFromCart(userId, itemId, itemType);
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return null;
    }

    const item = cart.items.find(
      (cartItem: any) => cartItem.itemId.toString() === itemId && cartItem.itemType === itemType
    );

    if (!item) {
      throw new Error("Item not in cart");
    }

    // Verify stock for products
    if (itemType === "product") {
      const product = await Product.findById(itemId);
      if (!product || product.stock < quantity) {
        throw new Error("Insufficient stock");
      }
    }

    item.quantity = quantity;
    await cart.save();

    const updated = await Cart.findOne({ userId }).lean();
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
