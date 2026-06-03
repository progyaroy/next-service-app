"use client";

import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button, Card, CardContent, CardTitle, TextInput, TextMuted } from "@/components/ui";
import { useUserSearch } from "@/features/chat/hooks/use-user-search";

type SearchForm = {
  q: string;
};

type UserSearchPanelProps = {
  onStartConversation: (participantId: string) => void;
};

export function UserSearchPanel({ onStartConversation }: UserSearchPanelProps) {
  const { register, control } = useForm<SearchForm>({
    defaultValues: { q: "" },
  });

  const query = useWatch({
    control,
    name: "q",
    defaultValue: "",
  });
  const debouncedQuery = useDebouncedValue(query, 300);
  const search = useUserSearch(debouncedQuery, 1);

  return (
    <Card className="h-[70vh] overflow-hidden p-0">
      <div className="border-b border-[var(--shop-border)] p-4">
        <CardTitle className="text-xl">Find users</CardTitle>
      </div>
      <CardContent className="mt-0 h-[calc(70vh-74px)] overflow-y-auto p-4">
        <TextInput
          placeholder="Search by username or name"
          autoComplete="off"
          {...register("q")}
        />

        {debouncedQuery.trim().length < 2 ? (
          <TextMuted className="mt-3 text-sm">Type at least 2 characters</TextMuted>
        ) : null}

        {search.isLoading ? <p className="mt-3 text-sm text-[var(--shop-muted)]">Searching...</p> : null}

        {search.data?.users?.length ? (
          <ul className="mt-4 space-y-2">
            {search.data.users.map((user) => (
              <li key={user.id} className="flex items-center justify-between rounded-xl border border-[var(--shop-border)] p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--shop-ink)]">{user.name}</p>
                  <p className="truncate text-xs text-[var(--shop-muted)]">@{user.username}</p>
                </div>
                <Button size="sm" onClick={() => onStartConversation(user.id)}>
                  Chat
                </Button>
              </li>
            ))}
          </ul>
        ) : null}

        {search.data && search.data.users.length === 0 && debouncedQuery.trim().length >= 2 ? (
          <TextMuted className="mt-4 text-sm">No users found.</TextMuted>
        ) : null}
      </CardContent>
    </Card>
  );
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}
