import type { Metadata } from "next";
import { getActivePreorder, getUserPreorderRegistration } from "@/actions/preorders";
import { PreOrderDetails } from "@/components/preorder/PreOrderDetails";
import Link from "next/link";
import { Sparkles, ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "Preorder Early Access | ArchiveVault",
  description: "Prebook upcoming exclusive products at locked early-bird discount prices."
};

export default async function PrebookPage() {
  const activePreorder = await getActivePreorder();
  
  if (activePreorder) {
    const userRegistration = await getUserPreorderRegistration(activePreorder.id);
    return <PreOrderDetails preorder={activePreorder} userRegistration={userRegistration} />;
  }

  return (
    <div className="min-h-screen bg-[#0f1810] py-16 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4 space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
          <Sparkles size={28} />
        </div>
        
        <div className="space-y-2">
          <h1 className="display-font text-3xl font-bold text-emerald-400">
            No Active Preorder Right Now
          </h1>
          <p className="text-sm text-cream/60 leading-relaxed">
            There are currently no live preorder campaigns running. Check back soon for our next exclusive early-access release!
          </p>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-emerald-950/40"
        >
          <ShoppingBag size={16} />
          <span>Browse Available Products</span>
        </Link>
      </div>
    </div>
  );
}
