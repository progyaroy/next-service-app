import NewService from "@/components/modules/admin/services/new";
import { productService } from "@/lib/services/product.service";

export default async function NewServicePage() {
  const products = await productService.getAllProducts();

  return <NewService products={products} />;
}
