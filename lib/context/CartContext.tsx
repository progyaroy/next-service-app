"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type CartItemType = "product" | "service";

export interface CartItem {
  itemId: string;
  itemType: CartItemType;
  quantity: number;
  snapshotPrice: number;
  snapshotData?: Record<string, any>;
  addedAt: string;
}

export interface Cart {
  _id?: string;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [itemCount, setItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/cart", {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });

      if (response.status === 401) {
        setCart(null);
        setItemCount(0);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.statusText}`);
      }

      const data = await response.json();
      const cartData = data.data || data;

      if (!cartData.items || !Array.isArray(cartData.items)) {
        throw new Error("Invalid cart response structure");
      }

      setCart(cartData);
      const count = cartData.items.reduce(
        (sum: number, item: CartItem) => sum + (item.quantity || 0),
        0
      );
      setItemCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cart");
      console.error("[CartContext] Error refreshing cart:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCart = useCallback(() => {
    setCart(null);
    setItemCount(0);
    setError(null);
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cart, itemCount, isLoading, error, refreshCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
