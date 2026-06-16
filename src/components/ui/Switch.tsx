"use client";

import type React from "react";
type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Switch(props: Props) {
  return <input type="checkbox" role="switch" className="h-4 w-8 accent-foreground" {...props} />;
}
