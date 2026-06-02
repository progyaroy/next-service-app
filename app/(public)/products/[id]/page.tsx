import { productService } from "@/lib/services/product.service";
import ProductDetails from "@/features/common/details";

export const revalidate = 60; // ISR

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await productService.getProductById(id);

  if (!product) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
          <p className="text-gray-600 mt-2">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const serializedProduct = {
    _id: String(product._id),
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category && typeof product.category === 'object' && 'name' in product.category
      ? {
          _id: String(product.category._id),
          name: product.category.name,
        }
      : null,
    stock: product.stock,
    image: product.image,
  };

  return <ProductDetails product={serializedProduct} />;
}
