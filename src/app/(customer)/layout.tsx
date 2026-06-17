import type React from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { requireUser } from "@/lib/guards";
import { getSiteSettings } from "@/actions/settings";
export const dynamic = "force-dynamic";
export default async function CustomerLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireUser();
  const settings = await getSiteSettings();
  return (
    <div className="min-h-screen flex flex-col">
      <Header siteName={settings.siteName} logoUrl={settings.logoUrl} />
      <main className="flex-1">{children}</main>
      <Footer siteName={settings.siteName} />
    </div>
  );
}
