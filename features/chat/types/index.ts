export type MessageType = "text" | "image" | "file" | "audio";

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
  status: "sent" | "delivered" | "read";
  createdAt: string;
  updatedAt: string;
};

export type MessagePage = {
  conversationId: string;
  messages: ChatMessage[];
  nextCursor: string | null;
};

export type SendMessageInput = {
  conversationId?: string;
  recipientId?: string;
  content: string;
  messageType?: MessageType;
};
