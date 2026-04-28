import { NextRequest } from "next/server";
import { productService } from "@/lib/services/product.service";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { getUserFromRequest } from "@/lib/api/auth";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/lib/errors/AppError";

// GET /api/products/[id]
export const GET = withErrorHandling(async (_req: NextRequest, { params }: any) => {
  const { id } = await params;
  const product = await productService.getProductById(id);
  if (!product) throw new NotFoundError("Product");
  return successResponse(product);
});

// PUT /api/products/[id]
export const PUT = withErrorHandling(async (req: NextRequest, { params }: any) => {
  const auth = await getUserFromRequest(req);
  if (!auth) throw new AuthenticationError();
  if (auth.role !== "admin") throw new AuthorizationError();

  const { id } = await params;
  const body = await req.json();
  const product = await productService.updateProduct(id, body);
  if (!product) throw new NotFoundError("Product");
  return successResponse(product);
});

// DELETE /api/products/[id]
export const DELETE = withErrorHandling(async (req: NextRequest, { params }: any) => {
  const auth = await getUserFromRequest(req);
  if (!auth) throw new AuthenticationError();
  if (auth.role !== "admin") throw new AuthorizationError();

  const { id } = await params;
  const deleted = await productService.deleteProduct(id);
  if (!deleted) throw new NotFoundError("Product");
  return successResponse({ deleted: true });
});
