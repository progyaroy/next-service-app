export type MessageType = "text" | "image" | "file" | "audio";
export type MessageStatus = "sent" | "delivered" | "read";

export type ChatUser = {
  id: string;
  email: string;
  username: string;
  name: string;
};

export type ConversationSummary = {
  id: string;
  participants: ChatUser[];
  lastMessage: {
    id: string;
    senderId: string;
    content: string;
    messageType: MessageType;
    createdAt: string;
  } | null;
  unreadCount: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
};

export type MessagePage = {
  conversationId: string;
  messages: ChatMessage[];
  nextCursor: string | null;
};

export type UserSearchResult = {
  users: ChatUser[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type SendMessagePayload = {
  conversationId?: string;
  recipientId?: string;
  content: string;
  messageType?: MessageType;
};

export type SendMessageResult = {
  conversation: ConversationSummary;
  message: ChatMessage;
};
