import { connectDB } from "@/lib/db/mongoose";
import Category from "@/lib/models/Category";

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
