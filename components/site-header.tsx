import { logoutAction } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth/session";
import { Button, ButtonLink, Form } from "@/components/ui";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-[var(--shop-border)] bg-[var(--shop-surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <ButtonLink href="/" variant="brand" size="sm">
          Lumière Parlour
        </ButtonLink>
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
      </div>
    </header>
  );
}
