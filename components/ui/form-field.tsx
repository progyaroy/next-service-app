import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";
import { Label } from "@/components/ui/label";

export type FormFieldProps = {
  id: string;
  label: string;
  /** Helper text below the control (hints, constraints). */
  description?: ReactNode;
  /** Per-field error copy; sets `aria-invalid` on the control when wired via clone. */
  error?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Groups a label, control, optional description, and optional field-level error.
 * When `description` or `error` is set and `children` is a single React element,
 * `aria-describedby`, `id`, and invalid state are forwarded for accessibility.
 */
export function FormField({
  id,
  label,
  description,
  error,
  children,
  className,
}: FormFieldProps) {
  const describedBy = [description ? `${id}-description` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  let control: ReactNode = children;
  if (isValidElement(children)) {
    control = cloneElement(children as ReactElement<Record<string, unknown>>, {
      id,
      ...(describedBy ? { "aria-describedby": describedBy } : {}),
      ...(error
        ? { "aria-invalid": true, invalid: true }
        : {}),
    });
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {control}
      {description ? (
        <p id={`${id}-description`} className="text-xs text-[var(--shop-muted)]">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
