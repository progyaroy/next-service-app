import { connectDB } from "@/lib/db/mongoose";
import Product from "@/lib/models/Product";
import { ProductsList } from "@/components/modules/admin/products/list";

export const metadata = {
  title: "Products",
  description: "Manage products",
};

export default async function ProductsPage() {
  await connectDB();
  const products = await Product.find().sort({ createdAt: -1 });

  return <ProductsList products={JSON.parse(JSON.stringify(products))} />;
}
