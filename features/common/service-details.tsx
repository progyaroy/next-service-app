"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";

interface IncludedProduct {
  productId: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

interface ServiceDetailsProps {
  service: {
    _id: string;
    name: string;
    description: string;
    basePrice: number;
    totalPrice: number;
    includedProducts: IncludedProduct[];
  };
}

const serviceGradients = [
  "from-rose-200 to-pink-300",
  "from-purple-200 to-violet-300",
  "from-amber-200 to-orange-300",
  "from-teal-200 to-cyan-300",
  "from-indigo-200 to-blue-300",
  "from-emerald-200 to-green-300",
];

function getGradient(id: string) {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return serviceGradients[Math.abs(hash) % serviceGradients.length];
}

export default function ServiceDetails({ service }: ServiceDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const gradient = getGradient(service._id);
  const hasProducts = service.includedProducts?.length > 0;

  const productsTotal = hasProducts
    ? service.includedProducts.reduce(
        (sum, item) => sum + item.productId.price * item.quantity,
        0
      )
    : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/services"
        className="mb-6 inline-flex items-center text-sm text-rose-600 hover:text-rose-700"
      >
        ← Back to Services
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Banner + Included Products */}
        <div className="space-y-6">
          {/* Banner */}
          <Card className="overflow-hidden p-0">
            <div
              className={`bg-gradient-to-br ${gradient} aspect-square flex flex-col items-center justify-center gap-4`}
            >
              <div className="text-8xl opacity-40">✂️</div>
              <span className="text-sm font-semibold bg-white/60 text-gray-800 px-4 py-1.5 rounded-full">
                Professional Service
              </span>
            </div>
          </Card>

          {/* Included Products */}
          {hasProducts && (
            <Card className="p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Included Products
              </h2>
              <div className="space-y-3">
                {service.includedProducts.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-600">
                        {item.productId.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.productId.name}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-500">
                            × {item.quantity}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{(item.productId.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right: Info + Add to Cart */}
        <div className="flex flex-col justify-between">
          {/* Badge */}
          <div>
            <span
              className="inline-block text-xs font-semibold px-3 py-1 rounded-full"
              style={{
                backgroundColor: "var(--shop-rose-soft)",
                color: "var(--shop-rose-strong)",
              }}
            >
              Parlour Service
            </span>
          </div>

          {/* Title */}
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {service.name}
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {service.description}
            </p>
          </div>

          {/* Price Breakdown */}
          <Card className="p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Price Breakdown
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service Charge</span>
                <span className="font-medium text-gray-900">
                  ₹{service.basePrice.toFixed(2)}
                </span>
              </div>

              {hasProducts &&
                service.includedProducts.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.productId.name}
                      {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                    </span>
                    <span className="font-medium text-gray-900">
                      ₹{(item.productId.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}

              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span
                  className="text-xl font-bold"
                  style={{ color: "var(--shop-rose-strong)" }}
                >
                  ₹{service.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          {/* Quantity + Add to Cart */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-16 px-3 py-2 border border-gray-300 rounded text-center text-sm"
                  min="1"
                />
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <AddToCartButton
              itemId={service._id}
              itemType="service"
              quantity={quantity}
              className="w-full"
            />
          </div>

          {/* Meta */}
          <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service ID:</span>
              <span className="text-gray-900 font-medium text-xs font-mono">
                {service._id}
              </span>
            </div>
            {hasProducts && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Included Products:</span>
                <span className="text-gray-900 font-medium">
                  {service.includedProducts.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
