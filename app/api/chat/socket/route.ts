import { NextRequest } from "next/server";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { getUserFromRequest } from "@/lib/api/auth";
import { AuthenticationError } from "@/lib/errors/AppError";
import { ensureChatSocketServer } from "@/lib/socket/chat-server";

export const runtime = "nodejs";

// POST /api/chat/socket
export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await getUserFromRequest(req);
  if (!auth) throw new AuthenticationError();

  const state = ensureChatSocketServer();

  return successResponse({
    started: true,
    port: Number(process.env.CHAT_SOCKET_PORT || 4001),
    initializedAt: state.initializedAt,
  });
});
