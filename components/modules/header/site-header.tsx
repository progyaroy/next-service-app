import { logoutAction } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth/session";
import { Button, ButtonLink, Form } from "@/components/ui";
import { CartIcon } from "@/components/ui/cart-icon";
import { HeaderNav } from "./header-nav";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-[var(--shop-border)] bg-[var(--shop-surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <ButtonLink href="/" variant="brand" size="sm">
          Lumière Parlour
        </ButtonLink>
        <HeaderNav initialUser={user} />
      </div>
    </header>
  );
}
