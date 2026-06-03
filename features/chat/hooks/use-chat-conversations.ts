"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createConversation, listConversations } from "@/features/chat/api/chat-api";
import type { ConversationSummary } from "@/features/chat/types";

export const chatConversationsQueryKey = ["chat", "conversations"];

export function useChatConversations() {
  return useQuery({
    queryKey: chatConversationsQueryKey,
    queryFn: listConversations,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConversation,
    onSuccess: (conversation) => {
      queryClient.setQueryData<ConversationSummary[]>(chatConversationsQueryKey, (prev) => {
        const list = Array.isArray(prev) ? prev : [];
        const existing = list.find((item) => item.id === conversation.id);
        if (existing) return list;
        return [conversation, ...list];
      });
    },
  });
}
