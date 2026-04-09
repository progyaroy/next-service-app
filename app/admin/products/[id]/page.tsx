import Link from "next/link";

export const metadata = {
  title: "Edit Product",
  description: "Edit product details",
};

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/products" className="text-blue-600 hover:text-blue-800">
          ← Back to Products
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Product</h1>
        <p className="text-gray-600">Product form will be implemented here</p>
      </div>
    </div>
  );
}
