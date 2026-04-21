"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: string;
  product?: {
    name: string;
    price: number;
    image?: string;
    stock: number;
  };
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [itemCount, setItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch cart from API with error handling
   * Only called on mount and when user performs cart mutations
   */
  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/cart", {
        cache: "no-store",
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (response.status === 401) {
        // User not authenticated
        setCart(null);
        setItemCount(0);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle new API response format { success, data, error, timestamp }
      const cartData = data.data || data;

      // Validate response structure
      if (!cartData.items || !Array.isArray(cartData.items)) {
        throw new Error("Invalid cart response structure");
      }

      setCart(cartData);

      // Calculate item count safely
      const count = cartData.items.reduce(
        (sum: number, item: CartItem) => sum + (item.quantity || 0),
        0
      );
      setItemCount(count);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load cart";
      setError(errorMessage);
      console.error("[CartContext] Error refreshing cart:", err);
      // Don't clear cart on error - keep stale data
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial cart load on mount only
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{ cart, itemCount, isLoading, error, refreshCart }}
    >
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
