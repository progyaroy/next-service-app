"use client";

import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";

interface CategoriesListProps {
  categories: any[];
}

export function CategoriesList({ categories }: CategoriesListProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage product categories</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Category
        </Link>
      </div>

      <DataTable
        columns={[
          { key: "name", label: "Name" },
          {
            key: "description",
            label: "Description",
            render: (value) => value || "-",
          },
          {
            key: "createdAt",
            label: "Created",
            render: (value) => new Date(value).toLocaleDateString(),
          },
        ]}
        data={categories}
        actions={(category) => (
          <div className="space-x-2">
            <Link
              href={`/admin/categories/${category._id}`}
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
