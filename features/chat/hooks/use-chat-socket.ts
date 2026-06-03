"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { getSocketToken, initSocketServer } from "@/features/chat/api/chat-api";
import { useChatStore } from "@/features/chat/store/chat.store";

export function useChatSocket() {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const setSocketConnected = useChatStore((state) => state.setSocketConnected);
  const setUserOnline = useChatStore((state) => state.setUserOnline);

  useEffect(() => {
    let mounted = true;

    async function connect() {
      try {
        await initSocketServer();
        const token = await getSocketToken();
        if (!mounted) return;

        const socketUrl = process.env.NEXT_PUBLIC_CHAT_SOCKET_URL || "http://localhost:4001";
        const socket = io(socketUrl, {
          transports: ["websocket"],
          auth: { token },
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
          setSocketConnected(true);
        });

        socket.on("disconnect", () => {
          setSocketConnected(false);
        });

        socket.on("user_online", ({ userId }: { userId: string }) => {
          setUserOnline(userId, true);
        });

        socket.on("user_offline", ({ userId }: { userId: string }) => {
          setUserOnline(userId, false);
        });

        socket.on("receive_message", (payload: unknown) => {
          queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });

          const conversationId =
            typeof payload === "object" &&
            payload !== null &&
            "conversation" in payload &&
            typeof (payload as { conversation?: { id?: unknown } }).conversation?.id === "string"
              ? (payload as { conversation: { id: string } }).conversation.id
              : undefined;

          if (conversationId) {
            queryClient.invalidateQueries({ queryKey: ["chat", "messages", conversationId] });
          }
        });

        socket.on("socket_error", (payload: { message: string }) => {
          console.error("[Chat Socket]", payload.message);
        });
      } catch (error) {
        console.error("[Chat Socket] Failed to initialize", error);
      }
    }

    connect();

    return () => {
      mounted = false;
      const socket = socketRef.current;
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
      }
    };
  }, [queryClient, setSocketConnected, setUserOnline]);
}
