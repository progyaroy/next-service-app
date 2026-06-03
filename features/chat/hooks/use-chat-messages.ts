"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessages, sendMessage } from "@/features/chat/api/chat-api";
import type { ConversationSummary, MessagePage } from "@/features/chat/types";

type MessageInfiniteData = {
  pageParams: Array<string | null>;
  pages: MessagePage[];
};

export function messageQueryKey(conversationId: string) {
  return ["chat", "messages", conversationId];
}

export function useChatMessages(conversationId: string | null) {
  return useInfiniteQuery({
    queryKey: conversationId ? messageQueryKey(conversationId) : ["chat", "messages", "disabled"],
    queryFn: ({ pageParam }) => {
      if (!conversationId) throw new Error("Conversation is required");
      return getMessages(conversationId, pageParam as string | null);
    },
    initialPageParam: null,
    enabled: Boolean(conversationId),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (result) => {
      const key = messageQueryKey(result.conversation.id);
      queryClient.setQueryData<MessageInfiniteData>(key, (prev) => {
        if (!prev || !prev.pages) return prev;
        const pages = [...prev.pages];
        const lastIndex = pages.length - 1;
        if (lastIndex >= 0) {
          pages[lastIndex] = {
            ...pages[lastIndex],
            messages: [...pages[lastIndex].messages, result.message],
          };
        }
        return { ...prev, pages };
      });

      queryClient.setQueryData<ConversationSummary[]>(["chat", "conversations"], (prev) => {
        if (!Array.isArray(prev)) return prev;
        const existing = prev.filter((item) => item.id !== result.conversation.id);
        return [result.conversation, ...existing];
      });
    },
  });
}
