import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import {
  ButtonLink,
  Card,
  PageEyebrow,
  PageLead,
  PageTitle,
  SectionTitle,
  TextMuted,
} from "@/components/ui";

export const homeMetadata: Metadata = {
  title: "Home",
  description: "Welcome — sign in to book services and manage your parlour profile.",
};

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col px-4 py-16 sm:px-6 sm:py-24">
      <PageEyebrow>Customer experience</PageEyebrow>
      <PageTitle>Your parlour, online.</PageTitle>
      <PageLead>
        This MVP starts with a <strong className="font-medium text-[var(--shop-ink)]">server-first</strong>{" "}
        home and <strong className="font-medium text-[var(--shop-ink)]">basic authentication</strong>: sessions
        live in an <strong className="font-medium text-[var(--shop-ink)]">httpOnly cookie</strong> (signed
        JWT). No tokens in <code className="rounded bg-[var(--shop-cream)] px-1">localStorage</code>.
        Mutations use <strong className="font-medium text-[var(--shop-ink)]">Server Actions</strong>.
      </PageLead>

      {user ? (
        <Card className="mt-10">
          <TextMuted>Signed in as</TextMuted>
          <p className="mt-1 font-medium text-[var(--shop-ink)]">{user.email}</p>
          <div className="mt-6">
            <ButtonLink href="/account" variant="primary" size="md">
              Go to account
            </ButtonLink>
          </div>
        </Card>
      ) : (
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/register" variant="primary" size="md">
            Create account
          </ButtonLink>
          <ButtonLink href="/login" variant="secondary" size="md">
            Sign in
          </ButtonLink>
        </div>
      )}

      <section className="mt-16 border-t border-[var(--shop-border)] pt-12">
        <SectionTitle>What&apos;s next</SectionTitle>
        <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-[var(--shop-muted)]">
          <li>Products &amp; services catalogue</li>
          <li>Book with date &amp; time and optional add-on products</li>
          <li>Booking history and admin tools — all via Server Actions where possible</li>
        </ul>
      </section>
    </div>
  );
}
