import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function PageEyebrow({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-sm font-medium uppercase tracking-widest text-[var(--shop-rose-strong)]",
        className
      )}
      {...props}
    />
  );
}

export function PageTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "mt-3 font-serif text-4xl font-semibold leading-tight tracking-tight text-[var(--shop-ink)] sm:text-5xl",
        className
      )}
      {...props}
    />
  );
}

export function PageLead({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "mt-6 text-lg leading-relaxed text-[var(--shop-muted)]",
        className
      )}
      {...props}
    />
  );
}

export function SectionTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) {
  return (
    <h2
      className={cn(
        "font-serif text-xl font-semibold text-[var(--shop-ink)]",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

/** Inner app screens (account, settings, etc.). */
export function ScreenTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "font-serif text-3xl font-semibold tracking-tight text-[var(--shop-ink)] sm:text-4xl",
        className
      )}
      {...props}
    />
  );
}

export function TextMuted({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-[var(--shop-muted)]", className)} {...props} />
  );
}
