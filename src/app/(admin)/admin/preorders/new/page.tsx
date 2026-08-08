import type { Metadata } from "next";
import { requireAdmin } from "@/lib/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { PreOrderForm } from "../PreOrderForm";

export const metadata: Metadata = {
  title: "New Preorder Campaign | Admin — ArchiveVault"
};

export default async function NewPreorderPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("name");

  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-1">
        <h1 className="display-font text-3xl font-bold text-emerald-400">Create Preorder Campaign</h1>
        <p className="text-sm text-cream/60">
          Set up an exclusive early-access preorder with a locked discount price for registered users.
        </p>
      </div>
      <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md">
        <PreOrderForm products={products || []} mode="create" />
      </div>
    </div>
  );
}
