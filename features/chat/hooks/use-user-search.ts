"use client";

import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "@/features/chat/api/chat-api";

export function useUserSearch(query: string, page = 1) {
  return useQuery({
    queryKey: ["chat", "user-search", query, page],
    queryFn: () => searchUsers(query, page),
    enabled: query.trim().length >= 2,
  });
}
