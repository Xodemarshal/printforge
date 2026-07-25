import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | ArchiveVault",
  description: "Learn about ArchiveVault."
};

export default function AboutPage() {
  return <div className="mx-auto max-w-4xl px-4 py-10">About ArchiveVault</div>;
}
