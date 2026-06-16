import type React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "secondary" | "gold";
};

export function Button({ className, variant = "default", ...props }: Props) {
  const styles =
    variant === "default"
      ? "bg-forest text-cream hover:bg-forest-light shadow-md shadow-forest/20"
      : variant === "gold"
      ? "bg-accent-warm text-primary-dark hover:bg-accent-warm/90 shadow-md"
      : variant === "secondary"
      ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      : "border border-forest/20 bg-cream/90 text-primary-medium hover:bg-cream hover:border-forest/30 dark:border-forest/30 dark:bg-primary/10 dark:text-foreground dark:hover:bg-primary/15";

  return (
    <button
      className={cn("rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200", styles, className)}
      {...props}
    />
  );
}
