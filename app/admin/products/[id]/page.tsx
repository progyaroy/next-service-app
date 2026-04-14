import EditProductForm from "@/components/modules/admin/products/edit";
import { productService, categoryService } from "@/lib/services/product.service";

export const metadata = {
  title: "Edit Product",
  description: "Edit product",
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    productService.getProductById(id),
    categoryService.getAllCategories(),
  ]);

  if (!product) {
    return <div className="text-center py-8 text-red-600">Product not found</div>;
  }

  const serializedProduct = {
    _id: String(product._id),
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category?._id ? String(product.category._id) : null,
    stock: product.stock,
    image: product.image,
  };

  const serializedCategories = categories.map((cat: any) => ({
    _id: String(cat._id),
    name: cat.name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600 mt-1">Update product information</p>
      </div>
      <EditProductForm id={id} initialData={serializedProduct} categories={serializedCategories} />
    </div>
  );
}
