"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/context/CartContext";
import {
  removeFromCartAction,
  updateCartQuantityAction,
  clearCartAction,
} from "@/lib/actions/cart";
import { placeOrderAction } from "@/lib/actions/order";
import { Button, Card, CardContent, CardTitle } from "@/components/ui";

export default function CartModule() {
  const router = useRouter();
  const { cart, itemCount, isLoading, refreshCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRemove = (productId: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("productId", productId);
      const result = await removeFromCartAction({}, formData);
      if (result.error) {
        setError(result.error);
      } else {
        await refreshCart();
      }
    });
  };

  const handleUpdate = (productId: string, quantity: number) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("productId", productId);
      formData.set("quantity", String(quantity));
      const result = await updateCartQuantityAction({}, formData);
      if (result.error) {
        setError(result.error);
      } else {
        await refreshCart();
      }
    });
  };

  const handleClear = () => {
    startTransition(async () => {
      const result = await clearCartAction();
      if (result.error) {
        setError(result.error);
      } else {
        await refreshCart();
      }
    });
  };

  const handlePlaceOrder = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await placeOrderAction();
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Order placed successfully!");
        await refreshCart();
        // Redirect to orders page after 2 seconds
        setTimeout(() => {
          router.push("/orders");
        }, 2000);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-center text-gray-600">Loading cart...</p>
      </div>
    );
  }

  if (!cart || itemCount === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-gray-600">Your cart is empty</p>
            <Link href="/products">
              <Button variant="primary">Continue Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const total = cart.items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Shopping Cart ({itemCount} items)</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="divide-y">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex gap-4 py-3 first:pt-3 last:pb-3">
                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900">{item.product?.name || "Product"}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      ${item.product?.price?.toFixed(2) || "0.00"} each
                    </p>

                    {/* Quantity & Remove */}
                    <div className="mt-2 flex items-center gap-3">
                      <select
                        value={item.quantity}
                        onChange={(e) => {
                          handleUpdate(item.productId, parseInt(e.target.value));
                        }}
                        disabled={isPending}
                        className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-50"
                      >
                        {Array.from({ length: item.product?.stock || 10 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Qty: {i + 1}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        disabled={isPending}
                        className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right whitespace-nowrap">
                    <p className="font-semibold text-sm">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Clear Cart Button */}
          <div className="mt-4">
            <button
              onClick={handleClear}
              disabled={isPending}
              className="text-xs text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardTitle className="border-b p-4 text-lg">Order Summary</CardTitle>
            <CardContent className="space-y-3 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-lg text-rose-600">${total.toFixed(2)}</span>
                </div>
              </div>
              <Button
                onClick={handlePlaceOrder}
                disabled={isPending}
                className="w-full mt-4"
                variant="primary"
              >
                {isPending ? "Placing Order..." : "Place Order"}
              </Button>
              <Link href="/products">
                <Button variant="ghost" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mt-4 rounded bg-green-50 p-3 text-sm text-green-600">
          ✓ {success}
        </div>
      )}

      {/* Error Messages */}
      {error && (
        <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
