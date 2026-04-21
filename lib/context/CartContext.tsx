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

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/cart", { cache: "no-store" });

      if (response.status === 401) {
        setCart(null);
        setItemCount(0);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }

      const data = await response.json();
      setCart(data);

      const count = data.items?.reduce(
        (sum: number, item: CartItem) => sum + item.quantity,
        0
      ) || 0;
      setItemCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setCart(null);
      setItemCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cart, itemCount, isLoading, error, refreshCart }}>
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
