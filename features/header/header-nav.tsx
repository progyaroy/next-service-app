"use client";

import { logoutAction } from "@/lib/actions/auth";
import { Button, ButtonLink, Form } from "@/components/ui";
import { CartIcon } from "@/components/ui/cart-icon";
import type { User } from "@/lib/auth/types";

interface HeaderNavProps {
  user: User | null;
}

export function HeaderNav({ user }: HeaderNavProps) {
  const handleLogout = async () => {
    window.dispatchEvent(new Event("auth-changed"));
    await logoutAction();
  };

  const LogoutButton = (
    <Form action={handleLogout} className="inline">
      <Button type="submit" variant="secondary" size="sm">
        Sign out
      </Button>
    </Form>
  );

  if (user?.role === "admin") {
    return (
      <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2" aria-label="Main">
        <ButtonLink href="/admin" variant="ghost" size="sm">
          Dashboard
        </ButtonLink>
    
        {LogoutButton}
      </nav>
    );
  }

  if (user?.role === "user") {
    return (
      <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2" aria-label="Main">
        <ButtonLink href="/" variant="ghost" size="sm">
          Home
        </ButtonLink>
        <ButtonLink href="/products" variant="ghost" size="sm">
          Products
        </ButtonLink>
        <ButtonLink href="/services" variant="ghost" size="sm">
          Services
        </ButtonLink>
        <ButtonLink href="/account" variant="ghost" size="sm">
          Account
        </ButtonLink>
        <ButtonLink href="/chat" variant="ghost" size="sm">
          Chat
        </ButtonLink>
        <CartIcon />
        {LogoutButton}
      </nav>
    );
  }

  // Unauthenticated
  return (
    <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2" aria-label="Main">
      <ButtonLink href="/" variant="ghost" size="sm">
        Home
      </ButtonLink>
      <ButtonLink href="/products" variant="ghost" size="sm">
        Products
      </ButtonLink>
      <ButtonLink href="/services" variant="ghost" size="sm">
        Services
      </ButtonLink>
      <ButtonLink href="/login" variant="ghost" size="sm">
        Sign in
      </ButtonLink>
      <ButtonLink href="/register" variant="primary" size="sm">
        Create account
      </ButtonLink>
    </nav>
  );
}
