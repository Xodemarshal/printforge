import type React from "react";
import { cn } from "@/lib/utils";

type Props = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: Props) {
  return (
    <select
      className={cn(
        "w-full rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-[#f4ecd9]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
