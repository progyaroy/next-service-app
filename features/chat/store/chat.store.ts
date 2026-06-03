"use client";

import { create } from "zustand";

type ChatStore = {
  selectedConversationId: string | null;
  draftMessage: string;
  socketConnected: boolean;
  onlineUsers: Record<string, boolean>;
  setSelectedConversationId: (conversationId: string | null) => void;
  setDraftMessage: (value: string) => void;
  setSocketConnected: (connected: boolean) => void;
  setUserOnline: (userId: string, online: boolean) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  selectedConversationId: null,
  draftMessage: "",
  socketConnected: false,
  onlineUsers: {},
  setSelectedConversationId: (selectedConversationId) => set({ selectedConversationId }),
  setDraftMessage: (draftMessage) => set({ draftMessage }),
  setSocketConnected: (socketConnected) => set({ socketConnected }),
  setUserOnline: (userId, online) =>
    set((state) => ({
      onlineUsers: {
        ...state.onlineUsers,
        [userId]: online,
      },
    })),
}));
