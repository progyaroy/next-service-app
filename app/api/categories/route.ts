import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Category from "@/lib/models/Category";
import { categoryService } from "@/lib/services/product.service";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { getUserFromRequest } from "@/lib/api/auth";
import { AuthenticationError, AuthorizationError } from "@/lib/errors/AppError";

// POST /api/categories (admin)
export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await getUserFromRequest(req);
  if (!auth) throw new AuthenticationError();
  if (auth.role !== "admin") throw new AuthorizationError();

  const { name, description } = await req.json();
  const category = await categoryService.createCategory(name, description);
  return successResponse(category, 201);
});

export const revalidate = 60; // ISR: revalidate every 60 seconds

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .lean();

    const serialized = categories.map((cat: any) => ({
      _id: String(cat._id),
      name: cat.name,
      description: cat.description,
    }));

    return Response.json(serialized);
  } catch (error: any) {
    console.error("API Error:", error);
    return Response.json(
      { error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
