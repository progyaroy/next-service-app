import { categoryService } from "@/lib/services/product.service";
import NewProduct from "@/features/admin/products/new";

export const metadata = {
  title: "Add Product",
  description: "Create a new product",
};

export default async function NewProductPage() {
  const categories = await categoryService.getAllCategories();
  
  const serialized = categories.map((cat: any) => ({
    _id: String(cat._id),
    name: cat.name,
  }));

  return <NewProduct categories={serialized} />;
}
