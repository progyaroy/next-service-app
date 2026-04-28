import { NextRequest } from "next/server";
import { serviceService } from "@/lib/services/service.service";
import { successResponse, errorResponse } from "@/lib/api/response";
import { getUserFromRequest } from "@/lib/api/auth";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/lib/errors/AppError";

// GET /api/services/[id]
export async function GET(_req: NextRequest, { params }: any) {
  try {
    const { id } = await params;
    const service = await serviceService.getServiceById(id);
    if (!service) throw new NotFoundError("Service");
    return successResponse(service);
  } catch (e) { return errorResponse(e); }
}

// PUT /api/services/[id] (admin)
export async function PUT(req: NextRequest, { params }: any) {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) throw new AuthenticationError();
    if (auth.role !== "admin") throw new AuthorizationError();
    const { id } = await params;
    const body = await req.json();
    const service = await serviceService.updateService(id, body);
    if (!service) throw new NotFoundError("Service");
    return successResponse(service);
  } catch (e) { return errorResponse(e); }
}

// DELETE /api/services/[id] (admin)
export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) throw new AuthenticationError();
    if (auth.role !== "admin") throw new AuthorizationError();
    const { id } = await params;
    const deleted = await serviceService.deleteService(id);
    if (!deleted) throw new NotFoundError("Service");
    return successResponse({ deleted: true });
  } catch (e) { return errorResponse(e); }
}
