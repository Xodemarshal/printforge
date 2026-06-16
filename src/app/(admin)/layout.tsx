import type React from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { requireAdmin } from "@/lib/guards";
import { ToastProvider } from "@/hooks/useToast";

export default async function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();
  return (
    <ToastProvider>
      <div className="dark min-h-screen bg-black text-white lg:grid lg:grid-cols-[260px_1fr]">
        <AdminSidebar />
        <main className="px-6 py-8">{children}</main>
      </div>
    </ToastProvider>
  );
}
