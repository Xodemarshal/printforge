"use client";

import * as React from "react";
import { MoonStar } from "lucide-react";

export function ThemeToggle() {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-cream/60 px-3 py-2 text-sm font-medium text-primary-medium backdrop-blur-sm shrink-0"
      title="Dark Mode Only"
    >
      <MoonStar size={16} />
      <span className="hidden sm:inline">Dark</span>
    </div>
  );
}
