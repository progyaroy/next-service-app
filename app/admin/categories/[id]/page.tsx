import EditCategoryForm from "@/components/modules/admin/categories/edit";
import { categoryService } from "@/lib/services/product.service";

export const metadata = {
  title: "Edit Category",
  description: "Edit category",
};

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const category = await categoryService.getCategoryById(id);

  if (!category) {
    return <div className="text-center py-8 text-red-600">Category not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
        <p className="text-gray-600 mt-1">Update category information</p>
      </div>
      <EditCategoryForm id={id} initialData={category} />
    </div>
  );
}
