import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type FormAlertProps = {
  children: ReactNode;
  className?: string;
};

/** Server / client form-level error summary (e.g. from useActionState). */
export function FormAlert({ children, className }: FormAlertProps) {
  if (children == null || children === false) return null;
  return (
    <p
      role="alert"
      className={cn("text-sm text-red-600 dark:text-red-400", className)}
    >
      {children}
    </p>
  );
}
