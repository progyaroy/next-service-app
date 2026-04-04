import { type FormHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type FormProps = FormHTMLAttributes<HTMLFormElement>;

export function Form({ className, ...props }: FormProps) {
  return <form className={cn("flex flex-col gap-5", className)} {...props} />;
}
