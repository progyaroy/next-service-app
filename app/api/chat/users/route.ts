import { NextRequest } from "next/server";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { getUserFromRequest } from "@/lib/api/auth";
import { AuthenticationError, ValidationError } from "@/lib/errors/AppError";
import { parsePositiveInt } from "@/lib/schemas/chat";
import chatService from "@/lib/services/chat.service";

// GET /api/chat/users
export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await getUserFromRequest(req);
  if (!auth) throw new AuthenticationError();

  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") || "").trim();
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = parsePositiveInt(searchParams.get("limit"), 10);

  if (query.length < 2) {
    throw new ValidationError("Search query must be at least 2 characters", "INVALID_SEARCH_QUERY");
  }

  const result = await chatService.searchUsers(auth.userId, query, page, limit);
  return successResponse(result);
});
