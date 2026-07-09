import type React from "react";
import { cn } from "@/lib/utils";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: Props) {
  return (
    <textarea
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#f4ecd9] outline-none ring-offset-background placeholder:text-[#c7b798] focus:ring-2 focus:ring-ring",
        className
      )}
      {...props}
    />
  );
}
