"use client";

import { useEffect, useState } from "react";
import { logoutAction } from "@/lib/actions/auth";
import { Button, ButtonLink, Form } from "@/components/ui";
import { CartIcon } from "@/components/ui/cart-icon";
import type { User } from "@/lib/auth/types";

interface HeaderNavProps {
  initialUser: User | null;
}

export function HeaderNav({ initialUser }: HeaderNavProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Verify auth state on mount only
  // CartContext handles visibility/focus events for cart refresh
  useEffect(() => {
    if (!isHydrated) return;

    const verifyAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const currentUser = await res.json();
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to verify auth:", error);
      }
    };

    // Verify on mount only
    verifyAuth();
  }, [isHydrated]);

  // Prevent hydration mismatch by not rendering auth-dependent content until hydrated
  if (!isHydrated) {
    return (
      <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2" aria-label="Main">
        <ButtonLink href="/" variant="ghost" size="sm">
          Home
        </ButtonLink>
        <ButtonLink href="/products" variant="ghost" size="sm">
          Products
        </ButtonLink>
        <ButtonLink href="/login" variant="ghost" size="sm">
          Sign in
        </ButtonLink>
      </nav>
    );
  }

  return (
    <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2" aria-label="Main">
      <ButtonLink href="/" variant="ghost" size="sm">
        Home
      </ButtonLink>
      <ButtonLink href="/products" variant="ghost" size="sm">
        Products
      </ButtonLink>
      {user ? (
        <>

          <ButtonLink href="/account" variant="ghost" size="sm">
            Dashboard
          </ButtonLink>
          <CartIcon />
          <Form action={logoutAction} className="inline">
            <Button type="submit" variant="ghostAccent" size="sm">
              Sign out
            </Button>
          </Form>
        </>
      ) : (
        <>
          <ButtonLink href="/login" variant="ghost" size="sm">
            Sign in
          </ButtonLink>
          <ButtonLink href="/register" variant="primary" size="sm">
            Create account
          </ButtonLink>
        </>
      )}
    </nav>
  );
}
