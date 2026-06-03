"use client";

import { useEffect } from "react";
import { useChatConversations, useCreateConversation } from "@/features/chat/hooks/use-chat-conversations";
import { useChatSocket } from "@/features/chat/hooks/use-chat-socket";
import { useChatStore } from "@/features/chat/store/chat.store";
import { ChatListPanel } from "@/features/chat/components/chat-list-panel";
import { UserSearchPanel } from "@/features/chat/components/user-search-panel";
import { ChatWindow } from "@/features/chat/components/chat-window";

type ChatFeatureProps = {
  currentUserId: string;
};

export default function ChatFeature({ currentUserId }: ChatFeatureProps) {
  const conversationsQuery = useChatConversations();
  const createConversation = useCreateConversation();
  const selectedConversationId = useChatStore((state) => state.selectedConversationId);
  const setSelectedConversationId = useChatStore((state) => state.setSelectedConversationId);

  useChatSocket();

  useEffect(() => {
    if (!selectedConversationId && conversationsQuery.data?.length) {
      setSelectedConversationId(conversationsQuery.data[0].id);
    }
  }, [conversationsQuery.data, selectedConversationId, setSelectedConversationId]);

  const selectedConversation =
    conversationsQuery.data?.find((conversation) => conversation.id === selectedConversationId) || null;

  async function handleStartConversation(participantId: string) {
    const conversation = await createConversation.mutateAsync(participantId);
    setSelectedConversationId(conversation.id);
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 lg:grid-cols-[300px_320px_1fr] sm:px-6">
      <ChatListPanel
        conversations={conversationsQuery.data || []}
        currentUserId={currentUserId}
        isLoading={conversationsQuery.isLoading}
      />
      <UserSearchPanel onStartConversation={handleStartConversation} />
      <ChatWindow conversation={selectedConversation} currentUserId={currentUserId} />
    </div>
  );
}
