import { NextRequest, NextResponse } from "next/server";
import { categoryService } from "@/lib/services/product.service";
import { successResponse, errorResponse } from "@/lib/api/response";
import { getUserFromRequest } from "@/lib/api/auth";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/lib/errors/AppError";

// GET /api/categories/[id]
export async function GET(_req: NextRequest, { params }: any) {
  try {
    const { id } = await params;
    const category = await categoryService.getCategoryById(id);
    if (!category) throw new NotFoundError("Category");
    return successResponse(category);
  } catch (e) { return errorResponse(e); }
}

// PUT /api/categories/[id] (admin)
export async function PUT(req: NextRequest, { params }: any) {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) throw new AuthenticationError();
    if (auth.role !== "admin") throw new AuthorizationError();
    const { id } = await params;
    const body = await req.json();
    const category = await categoryService.updateCategory(id, body);
    if (!category) throw new NotFoundError("Category");
    return successResponse(category);
  } catch (e) { return errorResponse(e); }
}

// DELETE /api/categories/[id] (admin)
export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) throw new AuthenticationError();
    if (auth.role !== "admin") throw new AuthorizationError();
    const { id } = await params;
    const deleted = await categoryService.deleteCategory(id);
    if (!deleted) throw new NotFoundError("Category");
    return successResponse({ deleted: true });
  } catch (e) { return errorResponse(e); }
}
