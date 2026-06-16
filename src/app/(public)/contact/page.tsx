import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | PrintForge",
  description: "Contact PrintForge support."
};

export default function ContactPage() {
  return <div className="mx-auto max-w-4xl px-4 py-10">Contact us at support@printforge.local</div>;
}
