import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/lib/models/Product";
import { productService } from "@/lib/services/product.service";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { getUserFromRequest } from "@/lib/api/auth";
import { AuthenticationError, AuthorizationError } from "@/lib/errors/AppError";

// POST /api/products (admin)
export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await getUserFromRequest(req);
  if (!auth) throw new AuthenticationError();
  if (auth.role !== "admin") throw new AuthorizationError();

  const { name, description, price, category, stock, image } = await req.json();
  const product = await productService.createProduct(name, description, price, category, stock, image);
  return successResponse(product, 201);
});

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
