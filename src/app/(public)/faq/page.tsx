import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | PrintForge",
  description: "Frequently asked questions about PrintForge."
};

export default function FaqPage() {
  return <div className="mx-auto max-w-4xl px-4 py-10">Frequently asked questions</div>;
}
