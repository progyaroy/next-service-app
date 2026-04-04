import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import {
  DescriptionDetails,
  DescriptionGroup,
  DescriptionList,
  DescriptionTerm,
  ScreenTitle,
  TextLink,
  TextMuted,
} from "@/components/ui";

export const accountMetadata: Metadata = {
  title: "Account",
  description: "Your parlour profile and settings.",
};

function formatMemberSince(createdAtMs: number): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(createdAtMs));
}

export default async function Account() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/account");
  }

  const joined = formatMemberSince(user.createdAt);

  return (
    <div className="mx-auto max-w-2xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <ScreenTitle>Account</ScreenTitle>
      <TextMuted className="mt-2">
        Server-rendered profile — session from httpOnly cookie.
      </TextMuted>

      <DescriptionList className="mt-10">
        <DescriptionGroup>
          <DescriptionTerm>Email</DescriptionTerm>
          <DescriptionDetails>{user.email}</DescriptionDetails>
        </DescriptionGroup>
        <DescriptionGroup>
          <DescriptionTerm>Role</DescriptionTerm>
          <DescriptionDetails className="capitalize">{user.role}</DescriptionDetails>
        </DescriptionGroup>
        <DescriptionGroup>
          <DescriptionTerm>Member since</DescriptionTerm>
          <DescriptionDetails>{joined}</DescriptionDetails>
        </DescriptionGroup>
      </DescriptionList>

      <TextMuted className="mt-8">
        Booking history and service customization will appear here in the next milestone.
      </TextMuted>

      <TextLink href="/" className="mt-6 inline-block">
        ← Home
      </TextLink>
    </div>
  );
}
