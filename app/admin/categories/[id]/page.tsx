import Link from "next/link";

export const metadata = {
  title: "Edit Category",
  description: "Edit category details",
};

export default function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/categories" className="text-blue-600 hover:text-blue-800">
          ← Back to Categories
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Category</h1>
        <p className="text-gray-600">Category form will be implemented here</p>
      </div>
    </div>
  );
}
