import type React from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { requireUser } from "@/lib/guards";

export default async function CustomerLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireUser();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
