import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type FormFooterTextProps = {
  children: ReactNode;
  className?: string;
};

export function FormFooterText({ children, className }: FormFooterTextProps) {
  return (
    <p className={cn("text-center text-sm text-[var(--shop-muted)]", className)}>
      {children}
    </p>
  );
}
