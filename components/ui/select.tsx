import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const selectFocus =
  "outline-none ring-[var(--shop-rose)] focus:ring-2 focus:ring-[var(--shop-rose-strong)]";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean | string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, disabled, children, ...props },
  ref
) {
  const hasError = Boolean(invalid);

  return (
    <select
      ref={ref}
      disabled={disabled}
      aria-invalid={hasError || undefined}
      className={cn(
        "w-full appearance-none rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2.5 text-sm text-[var(--shop-ink)]",
        "bg-[length:1rem_1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10",
        "[background-image:url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20fill=%27none%27%20viewBox=%270%200%2024%2024%27%20stroke=%27%2378716c%27%3E%3Cpath%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%20stroke-width=%272%27%20d=%27M6%209l6%206%206-6%27/%3E%3C/svg%3E')]",
        selectFocus,
        "disabled:cursor-not-allowed disabled:opacity-60",
        hasError &&
          "border-red-500/80 ring-red-500/30 focus:border-red-500 focus:ring-red-500/40 dark:border-red-400/60",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
