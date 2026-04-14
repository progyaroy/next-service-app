import { connectDB } from "@/lib/db/mongoose";
import Product from "@/lib/models/Product";

// export const revalidate = 60; // ISR: revalidate every 60 seconds

export async function GET() {
   console.log(">> DB HIT:", new Date().toISOString());
  try {
    await connectDB();
    const products = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .lean();

    const serialized = products.map((product: any) => ({
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

    return Response.json(serialized);
  } catch (error: any) {
    console.error("API Error:", error);
    return Response.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
