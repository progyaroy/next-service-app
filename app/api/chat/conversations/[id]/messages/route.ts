import { NextRequest } from "next/server";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { getUserFromRequest } from "@/lib/api/auth";
import { AuthenticationError } from "@/lib/errors/AppError";
import { parsePositiveInt } from "@/lib/schemas/chat";
import chatService from "@/lib/services/chat.service";

// GET /api/chat/conversations/:id/messages
export const GET = withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const auth = await getUserFromRequest(req);
    if (!auth) throw new AuthenticationError();

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parsePositiveInt(searchParams.get("limit"), 25);
    const { id } = await params;

    const page = await chatService.getMessages(id, auth.userId, cursor, limit);
    await chatService.markConversationRead(id, auth.userId);

    return successResponse(page);
  }
);
