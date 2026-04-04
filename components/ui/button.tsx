import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link, { type LinkProps } from "next/link";
import { cn } from "@/lib/utils/cn";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--shop-rose-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--shop-bg)]";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "ghostAccent"
  | "link"
  /** Wordmark / logo row in chrome (not a loud CTA). */
  | "brand";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonStyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: ButtonStyleProps & { className?: string }) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-medium transition-[opacity,colors,background-color] disabled:pointer-events-none disabled:opacity-50",
    focusRing,
    {
      primary:
        "rounded-full bg-[var(--shop-rose-strong)] text-white hover:opacity-90",
      secondary:
        "rounded-full border border-[var(--shop-border)] bg-transparent text-[var(--shop-ink)] hover:bg-[var(--shop-cream)]",
      outline:
        "rounded-full border border-[var(--shop-border)] bg-[var(--shop-surface)] text-[var(--shop-ink)] hover:bg-[var(--shop-cream)]",
      ghost:
        "rounded-full text-[var(--shop-muted)] hover:bg-[var(--shop-rose-soft)] hover:text-[var(--shop-ink)]",
      ghostAccent:
        "rounded-full font-medium text-[var(--shop-rose-strong)] hover:bg-[var(--shop-rose-soft)]",
      link: "rounded-md text-[var(--shop-rose-strong)] underline underline-offset-4 hover:opacity-90",
      brand:
        "rounded-lg px-2 py-2 font-serif text-base font-semibold text-[var(--shop-ink)] hover:bg-[var(--shop-rose-soft)]/60",
    }[variant],
    {
      sm: "px-3 py-2 text-sm",
      md: "px-5 py-2.5 text-sm",
      lg: "px-6 py-3 text-sm font-semibold sm:text-base",
    }[size],
    fullWidth && "w-full",
    className
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleProps & {
    /** When true, shows a subtle pending style (pair with `disabled` from the caller). */
    loading?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    fullWidth,
    loading,
    disabled,
    type = "button",
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      className={cn(
        buttonClassName({ variant, size, fullWidth, className }),
        loading && "cursor-wait opacity-80"
      )}
      {...props}
    />
  );
});

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
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClassName({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}
