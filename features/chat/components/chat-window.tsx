"use client";

import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button, Card, CardContent, CardTitle, TextInput, TextMuted } from "@/components/ui";
import { useChatMessages, useSendMessage } from "@/features/chat/hooks/use-chat-messages";
import { useChatStore } from "@/features/chat/store/chat.store";
import { MessageBubble } from "@/features/chat/components/message-bubble";
import type { ConversationSummary } from "@/features/chat/types";

type ChatWindowProps = {
  conversation: ConversationSummary | null;
  currentUserId: string;
};

type MessageForm = {
  message: string;
};

export function ChatWindow({ conversation, currentUserId }: ChatWindowProps) {
  const selectedConversationId = useChatStore((state) => state.selectedConversationId);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useChatMessages(selectedConversationId);
  const sendMessage = useSendMessage();
  const { register, handleSubmit, reset, setValue } = useForm<MessageForm>({
    defaultValues: { message: "" },
  });

  const messages = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.messages);
  }, [data]);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    setValue("message", "");
  }, [selectedConversationId, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    const trimmed = values.message.trim();
    if (!trimmed) return;

    if (!selectedConversationId) return;

    await sendMessage.mutateAsync({
      conversationId: selectedConversationId,
      content: trimmed,
      messageType: "text",
    });

    reset({ message: "" });
  });

  if (!conversation) {
    return (
      <Card className="h-[70vh] p-6">
        <CardTitle className="text-xl">Chat</CardTitle>
        <CardContent>
          <TextMuted>Select a conversation or start one from user search.</TextMuted>
        </CardContent>
      </Card>
    );
  }

  const other = conversation.participants.find((participant) => participant.id !== currentUserId);

  return (
    <Card className="h-[70vh] overflow-hidden p-0">
      <div className="border-b border-[var(--shop-border)] px-4 py-3">
        <CardTitle className="text-xl">{other?.name || other?.username}</CardTitle>
      </div>

      <CardContent className="mt-0 flex h-[calc(70vh-74px)] flex-col p-0">
        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {isLoading ? <p className="text-sm text-[var(--shop-muted)]">Loading messages...</p> : null}

          {hasNextPage ? (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="mx-auto block text-xs text-[var(--shop-rose-strong)] underline underline-offset-2 disabled:opacity-60"
            >
              {isFetchingNextPage ? "Loading..." : "Load older messages"}
            </button>
          ) : null}

          {messages.length === 0 && !isLoading ? (
            <TextMuted className="text-sm">No messages yet. Send the first message.</TextMuted>
          ) : null}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === currentUserId}
            />
          ))}
        </div>

        <form onSubmit={onSubmit} className="border-t border-[var(--shop-border)] p-3">
          <div className="flex items-center gap-2">
            <TextInput
              placeholder="Write a message"
              autoComplete="off"
              disabled={sendMessage.isPending}
              {...register("message")}
            />
            <Button type="submit" disabled={sendMessage.isPending}>
              Send
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
