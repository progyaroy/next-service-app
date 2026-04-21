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
  // Use product ID to deterministically select gradient
  const gradient = gradients[
    product._id.charCodeAt(0) % gradients.length
  ];

  return (
    <div className="container mx-auto py-12">
      <Link href="/products" className="text-purple-600 hover:text-purple-700 mb-6 inline-block">
        ← Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <Card className="overflow-hidden">
            <div className={`bg-gradient-to-br ${gradient} h-96 flex items-center justify-center`}>
              <div className="text-gray-400 text-8xl opacity-40">📦</div>
            </div>
          </Card>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category Badge */}
          <div>
            <span className="inline-block bg-rose-100 text-rose-800 text-sm font-semibold px-3 py-1 rounded">
              {product.category?.name || "Uncategorized"}
            </span>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-rose-600">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Stock Status */}
          <div>
            <p className={`text-lg font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center"
                    min="1"
                    max={product.stock}
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <AddToCartButton
                productId={product._id}
                quantity={quantity}
                className="w-full"
              />
            </div>
          )}

          {/* Out of Stock Button */}
          {product.stock === 0 && (
            <Button
              disabled
              className="w-full bg-gray-400 text-white py-3 rounded-lg font-semibold text-lg cursor-not-allowed"
            >
              Out of Stock
            </Button>
          )}

          {/* Additional Info */}
          <div className="border-t border-gray-200 pt-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Product ID:</span>
                <span className="text-gray-900 font-medium">{product._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="text-gray-900 font-medium">
                  {product.category?.name || "Uncategorized"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
