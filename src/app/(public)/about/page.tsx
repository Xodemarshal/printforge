import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | PrintForge",
  description: "Learn about PrintForge."
};

export default function AboutPage() {
  return <div className="mx-auto max-w-4xl px-4 py-10">About PrintForge</div>;
}
