import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { TextMuted } from "@/components/ui/page-intro";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-8 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "font-serif text-2xl font-semibold tracking-tight text-[var(--shop-ink)]",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <TextMuted className={cn("mt-2", className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-8", className)} {...props} />;
}
