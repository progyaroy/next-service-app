"use client";

import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";

interface ProductsListProps {
  products: any[];
}

export function ProductsList({ products }: ProductsListProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage all products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Product
        </Link>
      </div>

      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "category", label: "Category" },
          {
            key: "price",
            label: "Price",
            render: (value) => `$${value.toFixed(2)}`,
          },
          { key: "stock", label: "Stock" },
        ]}
        data={products}
        actions={(product) => (
          <div className="space-x-2">
            <Link
              href={`/admin/products/${product._id}`}
              className="text-blue-600 hover:text-blue-700"
            >
              Edit
            </Link>
          </div>
        )}
      />
    </div>
  );
}
