import Link from "next/link";

export default function AdminProductsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Add Product
        </Link>
      </div>

      <div className="bg-white p-8 rounded-lg shadow text-center">
        <p className="text-gray-500">No products found</p>
      </div>
    </div>
  );
}
