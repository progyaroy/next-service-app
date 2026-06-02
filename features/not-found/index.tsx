import { ButtonLink, ScreenTitle, TextMuted } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <ScreenTitle className="text-2xl sm:text-3xl">Page not found</ScreenTitle>
      <TextMuted className="mt-2">This URL is not part of the MVP yet.</TextMuted>
      <ButtonLink href="/" variant="primary" size="lg" className="mt-8">
        Home
      </ButtonLink>
    </div>
  );
}
