"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { buttonClassName, type ButtonStyleProps } from "./button";

export type ButtonLinkProps = LinkProps &
  ButtonStyleProps & {
    className?: string;
    children?: ReactNode;
  };

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  fullWidth,
  href,
  ...props
}: ButtonLinkProps) {
  const pathname = usePathname();
  
  // Check if the current path matches the link href
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  
  // Apply active variant styling
  const activeVariant = isActive ? "ghostAccent" : variant;
  
  return (
    <Link
      href={href}
      className={buttonClassName({ variant: activeVariant, size, fullWidth, className })}
      {...props}
    />
  );
}
