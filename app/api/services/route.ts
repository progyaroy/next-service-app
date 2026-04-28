import { NextRequest } from "next/server";
import { serviceService } from "@/lib/services/service.service";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { getUserFromRequest } from "@/lib/api/auth";
import { AuthenticationError, AuthorizationError } from "@/lib/errors/AppError";

// GET /api/services
export const GET = withErrorHandling(async () => {
  const services = await serviceService.getAllServices();
  return successResponse(services);
});

// POST /api/services (admin)
export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await getUserFromRequest(req);
  if (!auth) throw new AuthenticationError();
  if (auth.role !== "admin") throw new AuthorizationError();

  const { name, description, basePrice, includedProducts } = await req.json();
  const service = await serviceService.createService(name, description, basePrice, includedProducts);
  return successResponse(service, 201);
});
