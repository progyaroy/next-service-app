import Link, { type LinkProps } from "next/link";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type BackLinkProps = Omit<LinkProps, "href"> & {
  href?: LinkProps["href"];
  children?: ReactNode;
  className?: string;
};

export function BackLink({
  href = "/",
  className,
  children = "← Back to home",
  ...props
}: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "mb-8 inline-block text-sm text-[var(--shop-muted)] transition-colors hover:text-[var(--shop-rose-strong)]",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
