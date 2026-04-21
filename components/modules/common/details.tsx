"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: { _id: string; name: string } | null;
  stock: number;
  image?: string;
}

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (value: number) => {
    const newQuantity = Math.max(1, Math.min(value, product.stock));
    setQuantity(newQuantity);
  };

  const gradients = [
    "from-purple-200 to-pink-200",
    "from-green-200 to-emerald-200",
    "from-orange-200 to-red-200",
    "from-cyan-200 to-blue-200",
    "from-yellow-200 to-orange-200",
  ];
  const gradient = gradients[product._id.charCodeAt(0) % gradients.length];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Back Link */}
      <Link href="/products" className="mb-6 inline-flex items-center text-sm text-rose-600 hover:text-rose-700">
        ← Back to Products
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Image */}
        <div>
          <Card className="overflow-hidden">
            <div className={`bg-gradient-to-br ${gradient} aspect-square flex items-center justify-center`}>
              <div className="text-6xl opacity-40">📦</div>
            </div>
          </Card>
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-between">
          {/* Category Badge */}
          <div>
            <span className="inline-block bg-rose-100 text-rose-800 text-xs font-semibold px-3 py-1 rounded-full">
              {product.category?.name || "Uncategorized"}
            </span>
          </div>

          {/* Title & Price */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-rose-600">
                ${product.price.toFixed(2)}
              </span>
              <span className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Quantity & Add to Cart */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-16 px-3 py-2 border border-gray-300 rounded text-center text-sm"
                    min="1"
                    max={product.stock}
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <AddToCartButton
                productId={product._id}
                quantity={quantity}
                className="w-full"
              />
            </div>
          )}

          {/* Out of Stock */}
          {product.stock === 0 && (
            <Button
              disabled
              className="w-full bg-gray-400 text-white py-2 rounded font-semibold cursor-not-allowed"
            >
              Out of Stock
            </Button>
          )}

          {/* Product Meta */}
          <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Product ID:</span>
              <span className="text-gray-900 font-medium text-xs">{product._id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Category:</span>
              <span className="text-gray-900 font-medium">{product.category?.name || "Uncategorized"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
