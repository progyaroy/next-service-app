import { connectDB } from "@/lib/db/mongoose";
import Category from "@/lib/models/Category";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 });
    return Response.json(categories);
  } catch (error) {
    return Response.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
