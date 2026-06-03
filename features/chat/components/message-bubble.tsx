"use client";

import type { ChatMessage } from "@/features/chat/types";
import { cn } from "@/lib/utils/cn";

type MessageBubbleProps = {
  message: ChatMessage;
  isOwnMessage: boolean;
};

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <div className={cn("flex w-full", isOwnMessage ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
          isOwnMessage
            ? "bg-[var(--shop-rose-strong)] text-white"
            : "bg-[var(--shop-surface)] text-[var(--shop-ink)] border border-[var(--shop-border)]"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={cn(
            "mt-1 text-[11px]",
            isOwnMessage ? "text-white/80" : "text-[var(--shop-muted)]"
          )}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
