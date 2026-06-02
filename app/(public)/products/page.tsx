
// ==================== USING API =======================
// import ProductsClient from "@/components/modules/common/products";

// // ISR: revalidate every 60 seconds
// export const revalidate = 60;

// export const metadata = {
//   title: "Products",
//   description: "Browse our products",
// };

// // Fetch products (SERVER SIDE)
// async function getProducts() {
//   const res = await fetch("http://localhost:3000/api/products", {
//     next: { revalidate: 60 },
//   });

//   if (!res.ok) {
//     throw new Error("Failed to fetch products");
//   }

//   return res.json();
// }

// // Fetch categories (SERVER SIDE)
// async function getCategories() {
//   const res = await fetch("http://localhost:3000/api/categories", {
//     next: { revalidate: 60 },
//   });

//   if (!res.ok) {
//     throw new Error("Failed to fetch categories");
//   }

//   return res.json();
// }

// export default async function ProductsPage() {
//   const [products, categories] = await Promise.all([
//     getProducts(),
//     getCategories(),
//   ]);

//   return (
//     <ProductsClient
//       initialProducts={products}
//       initialCategories={categories}
//     />
//   );
// }

// =========================== X ===========================


// ====================== WITHOUT API ========================

import Products from "@/features/common/products";
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";

export const revalidate = 60;

export const metadata = {
  title: "Products",
  description: "Browse our products",
};

//  Fetch directly from DB
async function getData() {
  console.log(">>> DB HIT FROM SERVER:", new Date().toISOString());
  await connectDB();

  const [products, categories] = await Promise.all([
    Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .lean(),

    Category.find().sort({ name: 1 }).lean(),
  ]);

  // ✅ Serialize Mongo data
  const serializedProducts = products.map((product: any) => ({
    _id: String(product._id),
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category
      ? {
        _id: String(product.category._id),
        name: product.category.name,
      }
      : null,
    stock: product.stock,
    image: product.image,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }));

  const serializedCategories = categories.map((cat: any) => ({
    _id: String(cat._id),
    name: cat.name,
  }));

  return {
    products: serializedProducts,
    categories: serializedCategories,
  };
}

export default async function ProductsPage() {
  const { products, categories } = await getData();

  return (
    <Products
      initialProducts={products}
      initialCategories={categories}
    />
  );
}