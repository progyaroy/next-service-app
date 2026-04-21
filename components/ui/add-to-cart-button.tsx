"use client";

import { useTransition, useState } from "react";
import { addToCartAction } from "@/lib/actions/cart";
import { useCart } from "@/lib/context/CartContext";
import { Button } from "@/components/ui/button";

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  disabled?: boolean;
  className?: string;
}

export function AddToCartButton({
  productId,
  quantity = 1,
  disabled = false,
  className = "",
}: AddToCartButtonProps) {
  const { refreshCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<{ error?: string; success?: boolean }>({});

  const handleClick = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("productId", productId);
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
