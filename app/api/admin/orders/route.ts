import { NextRequest } from "next/server";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { getUserFromRequest } from "@/lib/api/auth";
import { AuthenticationError, AuthorizationError } from "@/lib/errors/AppError";
import orderService from "@/lib/services/order.service";

// GET /api/admin/orders (admin only)
export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await getUserFromRequest(req);
  if (!auth) throw new AuthenticationError();
  if (auth.role !== "admin") throw new AuthorizationError();

  const orders = await orderService.getAllOrders();
  return successResponse({ orders, count: orders.length });
});
