import { NextRequest } from "next/server";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { getUserFromRequest } from "@/lib/api/auth";
import { AuthenticationError } from "@/lib/errors/AppError";
import chatService from "@/lib/services/chat.service";

// GET /api/chat/conversations/:id
export const GET = withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const auth = await getUserFromRequest(req);
    if (!auth) throw new AuthenticationError();

    const { id } = await params;
    const conversation = await chatService.getConversationById(id, auth.userId);

    return successResponse(conversation);
  }
);
