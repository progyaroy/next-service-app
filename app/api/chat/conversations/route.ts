import { NextRequest } from "next/server";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { getUserFromRequest } from "@/lib/api/auth";
import { AuthenticationError } from "@/lib/errors/AppError";
import { parseConversationCreatePayload, parsePositiveInt } from "@/lib/schemas/chat";
import chatService from "@/lib/services/chat.service";

// GET /api/chat/conversations
export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await getUserFromRequest(req);
  if (!auth) throw new AuthenticationError();

  const { searchParams } = new URL(req.url);
  const limit = parsePositiveInt(searchParams.get("limit"), 20);

  const conversations = await chatService.listConversations(auth.userId, limit);
  return successResponse({ conversations, count: conversations.length });
});

// POST /api/chat/conversations
export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await getUserFromRequest(req);
  if (!auth) throw new AuthenticationError();

  const payload = parseConversationCreatePayload(await req.json());
  const conversation = await chatService.getOrCreateConversation(auth.userId, payload.participantId);

  return successResponse(conversation, 201);
});
