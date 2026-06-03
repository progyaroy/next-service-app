"use client";

import { Card, CardContent, CardTitle, TextMuted } from "@/components/ui";
import type { ConversationSummary } from "@/features/chat/types";
import { useChatStore } from "@/features/chat/store/chat.store";
import { cn } from "@/lib/utils/cn";

type ChatListPanelProps = {
  conversations: ConversationSummary[];
  currentUserId: string;
  isLoading: boolean;
};

function getOtherParticipant(conversation: ConversationSummary, currentUserId: string) {
  return conversation.participants.find((participant) => participant.id !== currentUserId);
}

export function ChatListPanel({ conversations, currentUserId, isLoading }: ChatListPanelProps) {
  const selectedConversationId = useChatStore((state) => state.selectedConversationId);
  const setSelectedConversationId = useChatStore((state) => state.setSelectedConversationId);

  return (
    <Card className="h-[70vh] overflow-hidden p-0">
      <div className="border-b border-[var(--shop-border)] p-4">
        <CardTitle className="text-xl">Conversations</CardTitle>
      </div>
      <CardContent className="mt-0 h-[calc(70vh-74px)] overflow-y-auto p-0">
        {isLoading ? (
          <div className="p-4 text-sm text-[var(--shop-muted)]">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4">
            <TextMuted>No conversations yet. Search a user to start chatting.</TextMuted>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--shop-border)]">
            {conversations.map((conversation) => {
              const other = getOtherParticipant(conversation, currentUserId);
              return (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={cn(
                      "w-full px-4 py-3 text-left hover:bg-[var(--shop-cream)]/60",
                      selectedConversationId === conversation.id && "bg-[var(--shop-rose-soft)]/70"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-[var(--shop-ink)]">
                        {other?.name || other?.username || "Unknown user"}
                      </p>
                      <span className="shrink-0 text-[11px] text-[var(--shop-muted)]">
                        {new Date(conversation.lastActivityAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-[var(--shop-muted)]">
                        {conversation.lastMessage?.content || "No messages yet"}
                      </p>
                      {conversation.unreadCount > 0 ? (
                        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--shop-rose-strong)] px-1.5 text-[10px] font-semibold text-white">
                          {conversation.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
