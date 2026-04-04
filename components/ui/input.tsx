import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const inputFocus =
  "outline-none ring-[var(--shop-rose)] focus:ring-2 focus:ring-[var(--shop-rose-strong)]";

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Sets `aria-invalid` and error styling when true or when a string is passed (message unused — use FormAlert for message). */
  invalid?: boolean | string;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { className, invalid, disabled, ...props },
  ref
) {
  const hasError = Boolean(invalid);

  return (
    <input
      ref={ref}
      disabled={disabled}
      aria-invalid={hasError || undefined}
      data-invalid={hasError ? "" : undefined}
      className={cn(
        "w-full rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2.5 text-sm text-[var(--shop-ink)] placeholder:text-[var(--shop-muted)]/70",
        inputFocus,
        "disabled:cursor-not-allowed disabled:opacity-60",
        hasError &&
          "border-red-500/80 ring-red-500/30 focus:border-red-500 focus:ring-red-500/40 dark:border-red-400/60",
        className
      )}
      {...props}
    />
  );
});

export type HiddenInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  name: string;
  value: string;
};

export function HiddenInput({ ...props }: HiddenInputProps) {
  return <input type="hidden" {...props} />;
}
