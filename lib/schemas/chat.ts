import { ValidationError } from "@/lib/errors/AppError";
import type { MessageType } from "@/lib/types/chat";

const allowedMessageTypes: MessageType[] = ["text", "image", "file", "audio"];

export function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new ValidationError("Invalid numeric parameter", "INVALID_QUERY_PARAM");
  }
  return Math.floor(parsed);
}

export function parseSendMessagePayload(payload: unknown): {
  conversationId?: string;
  recipientId?: string;
  content: string;
  messageType?: MessageType;
} {
  if (!payload || typeof payload !== "object") {
    throw new ValidationError("Invalid message payload", "INVALID_PAYLOAD");
  }

  const body = payload as Record<string, unknown>;

  const conversationId = typeof body.conversationId === "string" ? body.conversationId : undefined;
  const recipientId = typeof body.recipientId === "string" ? body.recipientId : undefined;
  const content = typeof body.content === "string" ? body.content : "";

  let messageType: MessageType | undefined;
  if (typeof body.messageType === "string") {
    if (!allowedMessageTypes.includes(body.messageType as MessageType)) {
      throw new ValidationError("Unsupported message type", "INVALID_MESSAGE_TYPE");
    }
    messageType = body.messageType as MessageType;
  }

  if (!conversationId && !recipientId) {
    throw new ValidationError("conversationId or recipientId is required", "MESSAGE_TARGET_REQUIRED");
  }

  return {
    conversationId,
    recipientId,
    content,
    messageType,
  };
}

export function parseConversationCreatePayload(payload: unknown): { participantId: string } {
  if (!payload || typeof payload !== "object") {
    throw new ValidationError("Invalid payload", "INVALID_PAYLOAD");
  }

  const participantId = (payload as Record<string, unknown>).participantId;

  if (typeof participantId !== "string" || !participantId.trim()) {
    throw new ValidationError("participantId is required", "PARTICIPANT_REQUIRED");
  }

  return { participantId };
}
