import { unstable_noStore as noStore } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { ButtonLink } from "@/components/ui";
import { HeaderNav } from "./header-nav";

export async function SiteHeader() {
  // Opt out of static rendering so cookies() always resolves correctly,
  // even when the parent page is force-static or ISR.
  noStore();

  const user = await getCurrentUser();

  return (
    <header className="border-b border-[var(--shop-border)] bg-[var(--shop-surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <ButtonLink href="/" variant="brand" size="sm">
          Lumière Parlour
        </ButtonLink>
        <HeaderNav user={user} />
      </div>
    </header>
  );
}
