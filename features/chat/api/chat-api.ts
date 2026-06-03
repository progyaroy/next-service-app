import type {
  ChatMessage,
  ChatUser,
  ConversationSummary,
  MessagePage,
  SendMessageInput,
} from "@/features/chat/types";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
};

async function apiRequest<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message || "Request failed");
  }

  return payload.data;
}

export async function searchUsers(query: string, page = 1, limit = 10): Promise<{
  users: ChatUser[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}> {
  const qs = new URLSearchParams({ q: query, page: String(page), limit: String(limit) });
  return apiRequest(`/api/chat/users?${qs.toString()}`);
}

export async function listConversations(): Promise<ConversationSummary[]> {
  const result = await apiRequest<{ conversations: ConversationSummary[] }>("/api/chat/conversations");
  return result.conversations;
}

export async function createConversation(participantId: string): Promise<ConversationSummary> {
  return apiRequest("/api/chat/conversations", {
    method: "POST",
    body: JSON.stringify({ participantId }),
  });
}

export async function getMessages(conversationId: string, cursor?: string | null): Promise<MessagePage> {
  const qs = new URLSearchParams({ limit: "25" });
  if (cursor) qs.set("cursor", cursor);
  return apiRequest(`/api/chat/conversations/${conversationId}/messages?${qs.toString()}`);
}

export async function sendMessage(input: SendMessageInput): Promise<{
  conversation: ConversationSummary;
  message: ChatMessage;
}> {
  return apiRequest("/api/chat/messages", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getSocketToken(): Promise<string> {
  const result = await apiRequest<{ token: string }>("/api/chat/socket-token");
  return result.token;
}

export async function initSocketServer(): Promise<void> {
  await apiRequest("/api/chat/socket", { method: "POST" });
}
