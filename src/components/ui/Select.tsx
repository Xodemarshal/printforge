import type React from "react";
import { cn } from "@/lib/utils";

type Props = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: Props) {
  return (
    <select
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#f4ecd9] outline-none",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
