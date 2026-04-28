"use client";

import { useTransition, useState } from "react";
import { addToCartAction } from "@/lib/actions/cart";
import { useCart } from "@/lib/context/CartContext";
import { Button } from "@/components/ui/button";
import type { CartItemType } from "@/lib/models/Cart";

interface AddToCartButtonProps {
  itemId?: string;
  itemType?: CartItemType;
  itemName?: string;
  itemPrice?: number;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  // Legacy support
  productId?: string;
}

export function AddToCartButton({
  itemId,
  itemType = "product",
  itemName,
  itemPrice,
  quantity = 1,
  disabled = false,
  className = "",
  productId,
}: AddToCartButtonProps) {
  const { refreshCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<{ error?: string; success?: boolean }>({});

  const finalItemId = itemId || productId || "";

  const handleClick = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("itemId", finalItemId);
      formData.set("itemType", itemType);
      formData.set("quantity", String(quantity));

      const result = await addToCartAction({}, formData);
      setState(result);

      // Refresh cart after action completes
      if (result.success) {
        await refreshCart();
      }
    });
  };

  return (
    <div className={className}>
      <Button
        onClick={handleClick}
        disabled={disabled || isPending}
        variant="primary"
        size="sm"
      >
        {isPending ? "Adding..." : "Add to Cart"}
      </Button>
      {state.error && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="mt-2 text-sm text-green-600">Added to cart!</p>
      )}
    </div>
  );
}
