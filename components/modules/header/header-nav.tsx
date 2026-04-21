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
    
    // Check for auth state changes by listening to storage events
    // This handles login/logout in other tabs
    const handleStorageChange = () => {
      // Trigger a re-check of auth state
      // In a real app, you might use a custom event or polling
      window.location.reload();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // On mount, verify the initial user state is still valid
  // This ensures the header reflects current auth state after page refresh
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
          <CartIcon />
          <ButtonLink href="/account" variant="ghost" size="sm">
            Account
          </ButtonLink>

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
