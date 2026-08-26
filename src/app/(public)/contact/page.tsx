import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Crafted Tale",
  description: "Contact Crafted Tale support."
};

export default function ContactPage() {
  return <div className="mx-auto max-w-4xl px-4 py-10">Contact us at support@craftedtale.in or call 8887369604</div>;
}
