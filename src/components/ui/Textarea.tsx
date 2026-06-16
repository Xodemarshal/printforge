import type React from "react";
import { cn } from "@/lib/utils";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: Props) {
  return (
    <textarea
      className={cn(
        "w-full rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm outline-none ring-offset-background placeholder:text-foreground/40 focus:ring-2 focus:ring-ring dark:border-white/10 dark:bg-white/5 dark:text-[#f4ecd9] dark:placeholder:text-[#c7b798]",
        className
      )}
      {...props}
    />
  );
}
