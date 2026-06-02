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
import type { CartItemType } from "@/lib/context/CartContext";

const serviceGradients = [
  "from-rose-200 to-pink-300",
  "from-purple-200 to-violet-300",
  "from-amber-200 to-orange-300",
  "from-teal-200 to-cyan-300",
];

const productGradients = [
  "from-purple-200 to-pink-200",
  "from-green-200 to-emerald-200",
  "from-orange-200 to-red-200",
  "from-cyan-200 to-blue-200",
];

function getGradient(id: string, type: CartItemType) {
  const list = type === "service" ? serviceGradients : productGradients;
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return list[Math.abs(hash) % list.length];
}

export default function CartModule() {
  const router = useRouter();
  const { cart, itemCount, isLoading, refreshCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRemove = (itemId: string, itemType: CartItemType) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("itemId", itemId);
      fd.set("itemType", itemType);
      const result = await removeFromCartAction({}, fd);
      if (result.error) setError(result.error);
      else await refreshCart();
    });
  };

  const handleUpdate = (itemId: string, quantity: number, itemType: CartItemType) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("itemId", itemId);
      fd.set("itemType", itemType);
      fd.set("quantity", String(quantity));
      const result = await updateCartQuantityAction({}, fd);
      if (result.error) setError(result.error);
      else await refreshCart();
    });
  };

  const handleClear = () => {
    startTransition(async () => {
      const result = await clearCartAction();
      if (result.error) setError(result.error);
      else await refreshCart();
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
        setTimeout(() => router.push("/orders"), 1500);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-gray-500">Loading cart…</p>
      </div>
    );
  }

  if (!cart || itemCount === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <p className="mb-6 text-gray-600 text-lg">Your cart is empty</p>
            <div className="flex justify-center gap-3">
              <Link href="/products">
                <Button variant="outline">Browse Products</Button>
              </Link>
              <Link href="/services">
                <Button variant="primary">Browse Services</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const total = cart.items.reduce(
    (sum, item) => sum + item.snapshotPrice * item.quantity,
    0
  );

  const productItems = cart.items.filter((i) => i.itemType === "product");
  const serviceItems = cart.items.filter((i) => i.itemType === "service");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        Shopping Cart
        <span className="ml-3 text-lg font-normal text-gray-500">
          ({itemCount} item{itemCount !== 1 ? "s" : ""})
        </span>
      </h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">

          {/* Services section */}
          {serviceItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Services ({serviceItems.length})
              </p>
              <Card className="p-0 overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {serviceItems.map((item) => {
                    const name = item.snapshotData?.name || "Service";
                    const gradient = getGradient(item.itemId, "service");
                    return (
                      <div key={item.itemId} className="flex gap-4 p-4">
                        {/* Thumbnail */}
                        <div className={`bg-gradient-to-br ${gradient} w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl`}>
                          ✂️
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>
                              <span
                                className="inline-block text-xs font-medium px-2 py-0.5 rounded mt-1"
                                style={{ backgroundColor: "var(--shop-rose-soft)", color: "var(--shop-rose-strong)" }}
                              >
                                Service
                              </span>
                            </div>
                            <p className="font-bold text-gray-900 whitespace-nowrap">
                              ₹{(item.snapshotPrice * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center gap-4">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() => handleUpdate(item.itemId, item.quantity - 1, "service")}
                                disabled={isPending || item.quantity <= 1}
                                className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-sm"
                              >
                                −
                              </button>
                              <span className="px-3 py-1.5 text-sm font-medium border-x border-gray-200">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdate(item.itemId, item.quantity + 1, "service")}
                                disabled={isPending}
                                className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-sm"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-xs text-gray-500">
                              ₹{item.snapshotPrice.toFixed(2)} each
                            </span>
                            <button
                              onClick={() => handleRemove(item.itemId, "service")}
                              disabled={isPending}
                              className="ml-auto text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* Products section */}
          {productItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Products ({productItems.length})
              </p>
              <Card className="p-0 overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {productItems.map((item) => {
                    const name = item.snapshotData?.name || "Product";
                    const gradient = getGradient(item.itemId, "product");
                    return (
                      <div key={item.itemId} className="flex gap-4 p-4">
                        {/* Thumbnail */}
                        <div className={`bg-gradient-to-br ${gradient} w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl opacity-80`}>
                          📦
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>
                              <span className="inline-block text-xs font-medium px-2 py-0.5 rounded mt-1 bg-gray-100 text-gray-600">
                                Product
                              </span>
                            </div>
                            <p className="font-bold text-gray-900 whitespace-nowrap">
                              ₹{(item.snapshotPrice * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center gap-4">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() => handleUpdate(item.itemId, item.quantity - 1, "product")}
                                disabled={isPending || item.quantity <= 1}
                                className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-sm"
                              >
                                −
                              </button>
                              <span className="px-3 py-1.5 text-sm font-medium border-x border-gray-200">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdate(item.itemId, item.quantity + 1, "product")}
                                disabled={isPending}
                                className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-sm"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-xs text-gray-500">
                              ₹{item.snapshotPrice.toFixed(2)} each
                            </span>
                            <button
                              onClick={() => handleRemove(item.itemId, "product")}
                              disabled={isPending}
                              className="ml-auto text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* Clear cart */}
          <div className="text-right">
            <button
              onClick={handleClear}
              disabled={isPending}
              className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              Clear entire cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardTitle className="border-b p-5 text-base">Order Summary</CardTitle>
            <CardContent className="p-5 space-y-3">
              {/* Line items */}
              {serviceItems.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Services ({serviceItems.reduce((s, i) => s + i.quantity, 0)})
                  </span>
                  <span className="font-medium">
                    ₹{serviceItems.reduce((s, i) => s + i.snapshotPrice * i.quantity, 0).toFixed(2)}
                  </span>
                </div>
              )}
              {productItems.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Products ({productItems.reduce((s, i) => s + i.quantity, 0)})
                  </span>
                  <span className="font-medium">
                    ₹{productItems.reduce((s, i) => s + i.snapshotPrice * i.quantity, 0).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-xl" style={{ color: "var(--shop-rose-strong)" }}>
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={isPending}
                variant="primary"
                fullWidth
                className="mt-2"
              >
                {isPending ? "Placing Order…" : "Place Order"}
              </Button>

              <div className="flex gap-2 pt-1">
                <Link href="/products" className="flex-1">
                  <Button variant="outline" fullWidth size="sm">
                    Products
                  </Button>
                </Link>
                <Link href="/services" className="flex-1">
                  <Button variant="outline" fullWidth size="sm">
                    Services
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {success && (
        <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700 flex items-center gap-2">
          <span>✓</span> {success}
        </div>
      )}
      {error && (
        <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
