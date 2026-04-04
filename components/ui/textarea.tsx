import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const areaFocus =
  "outline-none ring-[var(--shop-rose)] focus:ring-2 focus:ring-[var(--shop-rose-strong)]";

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean | string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { className, invalid, disabled, ...props },
  ref
) {
  const hasError = Boolean(invalid);

  return (
    <textarea
      ref={ref}
      disabled={disabled}
      aria-invalid={hasError || undefined}
      className={cn(
        "min-h-[120px] w-full resize-y rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2.5 text-sm text-[var(--shop-ink)] placeholder:text-[var(--shop-muted)]/70",
        areaFocus,
        "disabled:cursor-not-allowed disabled:opacity-60",
        hasError &&
          "border-red-500/80 ring-red-500/30 focus:border-red-500 focus:ring-red-500/40 dark:border-red-400/60",
        className
      )}
      {...props}
    />
  );
});
