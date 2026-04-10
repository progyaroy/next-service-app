import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, disabled, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type="checkbox"
      disabled={disabled}
      className={cn(
        "h-4 w-4 rounded border border-[var(--shop-border)] bg-[var(--shop-surface)] text-[var(--shop-rose)] accent-[var(--shop-rose)]",
        "cursor-pointer",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "focus:outline-none focus:ring-2 focus:ring-[var(--shop-rose)] focus:ring-offset-2",
        className
      )}
      {...props}
    />
  );
});
