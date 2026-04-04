import Link, { type LinkProps } from "next/link";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type TextLinkProps = LinkProps & {
  className?: string;
  children?: ReactNode;
};

/** Inline text-style link (forms, prose). For button-shaped navigation use `ButtonLink`. */
export function TextLink({ className, ...props }: TextLinkProps) {
  return (
    <Link
      className={cn(
        "font-medium text-[var(--shop-rose-strong)] underline underline-offset-2 hover:opacity-90",
        className
      )}
      {...props}
    />
  );
}
