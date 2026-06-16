"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { MoonStar, SunMedium } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Theme"
        className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-cream/60 px-3 py-2 text-sm font-medium text-primary-medium opacity-70"
        disabled
      >
        <span className="h-4 w-4 rounded-full border border-current" />
        <span className="hidden">Theme</span>
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-cream/60 px-3 py-2 text-sm font-medium text-primary-medium transition-all duration-300 hover:bg-cream/90 backdrop-blur-sm shrink-0"
    >
      {isDark ? <SunMedium size={16} /> : <MoonStar size={16} />}
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
