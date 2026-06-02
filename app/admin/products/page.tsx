import { connectDB } from "@/lib/db/mongoose";
import Product from "@/lib/models/Product";
import { ProductsList } from "@/features/admin/products/list";

export const metadata = {
  title: "Products",
  description: "Manage products",
};

export default async function ProductsPage() {
  await connectDB();
  const products = await Product.find().populate("category", "name").sort({ createdAt: -1 });
console.log(products);
  return <ProductsList products={JSON.parse(JSON.stringify(products))} />;
}
