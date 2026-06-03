import { NextRequest } from "next/server";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { getUserFromRequest } from "@/lib/api/auth";
import { AuthenticationError } from "@/lib/errors/AppError";
import { parseSendMessagePayload } from "@/lib/schemas/chat";
import chatService from "@/lib/services/chat.service";
import { ensureChatSocketServer } from "@/lib/socket/chat-server";

// POST /api/chat/messages
export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await getUserFromRequest(req);
  if (!auth) throw new AuthenticationError();

  const payload = parseSendMessagePayload(await req.json());

  // Persist first, then broadcast to avoid phantom real-time messages.
  const result = await chatService.sendMessage({
    senderId: auth.userId,
    conversationId: payload.conversationId,
    recipientId: payload.recipientId,
    content: payload.content,
    messageType: payload.messageType,
  });

  const socket = ensureChatSocketServer();
  result.conversation.participants.forEach((participant) => {
    socket.io.to(`user:${participant.id}`).emit("receive_message", result);
  });

  return successResponse(result, 201);
});
