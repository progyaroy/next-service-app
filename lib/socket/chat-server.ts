import { createServer, type Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { jwtVerify } from "jose";
import chatService from "@/lib/services/chat.service";
import { addSocket, removeSocket } from "@/lib/socket/presence";
import type { SendMessagePayload } from "@/lib/types/chat";

const SOCKET_PORT = Number(process.env.CHAT_SOCKET_PORT || 4001);

type SocketServerState = {
  httpServer: HttpServer;
  io: SocketServer;
  initializedAt: string;
};

const globalScope = globalThis as typeof globalThis & {
  __chatSocketServer?: SocketServerState;
};

function getSecretKey(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (raw && raw.length >= 32) return new TextEncoder().encode(raw);
  if (process.env.NODE_ENV === "development") {
    return new TextEncoder().encode("dev-insecure-parlour-secret-min-32-chars!");
  }
  throw new Error("AUTH_SECRET is required in production (min 32 characters).");
}

async function verifySocketToken(token?: string): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    const userId = payload.sub as string;
    return userId || null;
  } catch {
    return null;
  }
}

function extractMessageError(error: unknown): { message: string; code: string } {
  if (error instanceof Error) {
    return { message: error.message, code: "MESSAGE_SEND_FAILED" };
  }
  return { message: "Failed to send message", code: "MESSAGE_SEND_FAILED" };
}

export function ensureChatSocketServer(): SocketServerState {
  if (globalScope.__chatSocketServer) {
    return globalScope.__chatSocketServer;
  }

  const httpServer = createServer();
  const io = new SocketServer(httpServer, {
    cors: {
      origin: (_origin, callback) => callback(null, true),
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    const userId = await verifySocketToken(token);

    if (!userId) {
      next(new Error("Unauthorized socket connection"));
      return;
    }

    socket.data.userId = userId;
    next();
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    const totalConnections = addSocket(userId, socket.id);

    socket.join(`user:${userId}`);
    io.emit("user_online", { userId, totalConnections });

    socket.on("send_message", async (payload: SendMessagePayload, ack?: (response: unknown) => void) => {
      try {
        const result = await chatService.sendMessage({
          senderId: userId,
          conversationId: payload.conversationId,
          recipientId: payload.recipientId,
          content: payload.content,
          messageType: payload.messageType,
        });

        const participantIds = result.conversation.participants.map((participant) => participant.id);

        participantIds.forEach((participantId) => {
          io.to(`user:${participantId}`).emit("receive_message", {
            conversation: result.conversation,
            message: result.message,
          });
        });

        ack?.({ success: true, data: result });
      } catch (error) {
        const errorPayload = extractMessageError(error);
        socket.emit("socket_error", errorPayload);
        ack?.({ success: false, error: errorPayload });
      }
    });

    socket.on("disconnect", () => {
      const remaining = removeSocket(userId, socket.id);
      if (remaining === 0) {
        io.emit("user_offline", { userId });
      }
    });
  });

  httpServer.listen(SOCKET_PORT);

  const state: SocketServerState = {
    httpServer,
    io,
    initializedAt: new Date().toISOString(),
  };

  globalScope.__chatSocketServer = state;
  return state;
}
