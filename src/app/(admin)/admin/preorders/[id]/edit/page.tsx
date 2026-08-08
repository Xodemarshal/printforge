import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/guards";
import { getPreorderById } from "@/actions/preorders";
import { createAdminClient } from "@/lib/supabase/admin";
import { PreOrderForm } from "../../PreOrderForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const preorder = await getPreorderById(id);
  return {
    title: `Edit: ${preorder?.title || "Preorder"} | Admin — ArchiveVault`
  };
}

export default async function EditPreorderPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const [preorder, productsResult] = await Promise.all([
    getPreorderById(id),
    createAdminClient().from("products").select("*").eq("active", true).order("name")
  ]);

  if (!preorder) notFound();

  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-1">
        <h1 className="display-font text-3xl font-bold text-emerald-400">Edit Preorder Campaign</h1>
        <p className="text-sm text-cream/60">{preorder.title}</p>
      </div>
      <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md">
        <PreOrderForm
          products={productsResult.data || []}
          preorder={preorder}
          mode="edit"
        />
      </div>
    </div>
  );
}
