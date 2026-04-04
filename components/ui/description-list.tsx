import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function DescriptionList({
  className,
  ...props
}: HTMLAttributes<HTMLDListElement>) {
  return (
    <dl
      className={cn(
        "space-y-6 rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-6",
        className
      )}
      {...props}
    />
  );
}

export function DescriptionTerm({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <dt
      className={cn(
        "text-xs font-medium uppercase tracking-wider text-[var(--shop-muted)]",
        className
      )}
      {...props}
    />
  );
}

export function DescriptionDetails({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <dd className={cn("mt-1 text-[var(--shop-ink)]", className)} {...props} />
  );
}

export function DescriptionGroup({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} {...props} />;
}
