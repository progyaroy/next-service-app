import { NextRequest } from "next/server";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { getUserFromRequest } from "@/lib/api/auth";
import { AuthenticationError, NotFoundError } from "@/lib/errors/AppError";
import orderService from "@/lib/services/order.service";

// GET /api/orders/[id]
export const GET = withErrorHandling(async (req: NextRequest, { params }: any) => {
  const auth = await getUserFromRequest(req);
  if (!auth) throw new AuthenticationError();

  const { id } = await params;
  const order = await orderService.getOrder(id, auth.userId);
  if (!order) throw new NotFoundError("Order");
  return successResponse(order);
});
