import ProductsClient from "@/components/modules/common/products";

// ISR: revalidate every 60 seconds
export const revalidate = 60;

export const metadata = {
  title: "Products",
  description: "Browse our products",
};

// Fetch products (SERVER SIDE)
async function getProducts() {
  const res = await fetch("http://localhost:3000/api/products", {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

// Fetch categories (SERVER SIDE)
async function getCategories() {
  const res = await fetch("http://localhost:3000/api/categories", {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  return res.json();
}

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <ProductsClient
      initialProducts={products}
      initialCategories={categories}
    />
  );
}