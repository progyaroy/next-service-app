import { connectDB } from "@/lib/db/mongoose";
import Category from "@/lib/models/Category";
import { CategoriesList } from "@/features/admin/categories/list";

export const metadata = {
  title: "Categories",
  description: "Manage categories",
};

export default async function CategoriesPage() {
  await connectDB();
  const categories = await Category.find().sort({ createdAt: -1 });

  return <CategoriesList categories={JSON.parse(JSON.stringify(categories))} />;
}
