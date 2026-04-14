"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: { _id: string; name: string } | null;
  stock: number;
  image?: string;
}

interface Category {
  _id: string;
  name: string;
}

const ITEMS_PER_PAGE = 12;

export default function Products({
  initialProducts,
  initialCategories,
}: {
  initialProducts: Product[];
  initialCategories: Category[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products] = useState<Product[]>(initialProducts);
  const [categories] = useState<Category[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // ✅ Page from URL
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(pageFromUrl);

  // Sync on back/forward
  useEffect(() => {
    setCurrentPage(pageFromUrl);
  }, [pageFromUrl]);

  // Filter
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category?._id === selectedCategory)
    : products;

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // ✅ Stable gradient (NO hydration issue)
  const getGradient = (id: string) => {
    const gradients = [
      "from-purple-200 to-pink-200",
      "from-green-200 to-emerald-200",
      "from-orange-200 to-red-200",
      "from-cyan-200 to-blue-200",
      "from-yellow-200 to-orange-200",
      "from-indigo-200 to-purple-200",
      "from-rose-200 to-pink-200",
      "from-teal-200 to-green-200",
      "from-amber-200 to-orange-200",
      "from-violet-200 to-purple-200",
      "from-fuchsia-200 to-pink-200",
      "from-lime-200 to-green-200",
    ];

    const hash = id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return gradients[Math.abs(hash) % gradients.length];
  };

  // ✅ URL update
  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));

    router.push(`?${params.toString()}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    router.push(`?${params.toString()}`);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900">Our Products</h1>
        <p className="text-gray-600 mt-2">
          Discover our collection of premium products
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Categories
            </h2>

            <div className="space-y-2">
              {/* All */}
              <button
                onClick={() => handleCategoryChange("")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === ""
                    ? "text-white bg-[var(--shop-rose-strong)]"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                All Products
              </button>

              {/* Categories */}
              {categories.map((category) => {
                const isActive = selectedCategory === category._id;

                return (
                  <button
                    key={category._id}
                    onClick={() => handleCategoryChange(category._id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "text-white bg-[var(--shop-rose-strong)]"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {paginatedProducts.length} of{" "}
                {filteredProducts.length} products
              </p>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="lg:col-span-3">
          {paginatedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No products found</p>
            </div>
          ) : (
            <>
              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedProducts.map((product) => {
                  const gradient = getGradient(product._id);

                  return (
                    <Link key={product._id} href={`/products/${product._id}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                        {/* Image */}
                        <div
                          className={`bg-gradient-to-br ${gradient} h-48 flex items-center justify-center`}
                        >
                          <div className="text-gray-400 text-6xl opacity-40">
                            📦
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <div className="mb-2">
                            <span
                              className="inline-block text-xs font-semibold px-2 py-1 rounded"
                              style={{
                                backgroundColor: "var(--shop-rose-soft)",
                                color: "var(--shop-rose-strong)",
                              }}
                            >
                              {product.category?.name || "Uncategorized"}
                            </span>
                          </div>

                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {product.name}
                          </h3>

                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {product.description}
                          </p>

                          <div className="flex justify-between items-center">
                            <span
                              className="text-2xl font-bold"
                              style={{
                                color: "var(--shop-rose-strong)",
                              }}
                            >
                              ${product.price.toFixed(2)}
                            </span>

                            <span
                              className={`text-sm font-medium ${
                                product.stock > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {product.stock > 0
                                ? "In Stock"
                                : "Out of Stock"}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  {/* Prev */}
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {/* Pages */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      const isActive = currentPage === page;

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            isActive
                              ? "text-white bg-[var(--shop-rose-strong)]"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}

                  {/* Next */}
                  <button
                    onClick={() =>
                      handlePageChange(
                        Math.min(totalPages, currentPage + 1)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}