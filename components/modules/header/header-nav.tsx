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
      <Button type="submit" variant="ghostAccent" size="sm">
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
        <ButtonLink href="/admin/products" variant="ghost" size="sm">
          Products
        </ButtonLink>
        <ButtonLink href="/admin/orders" variant="ghost" size="sm">
          Orders
        </ButtonLink>
        <ButtonLink href="/admin/users" variant="ghost" size="sm">
          Users
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
        <ButtonLink href="/account" variant="ghost" size="sm">
          Account
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
      <ButtonLink href="/login" variant="ghost" size="sm">
        Sign in
      </ButtonLink>
      <ButtonLink href="/register" variant="primary" size="sm">
        Create account
      </ButtonLink>
    </nav>
  );
}
