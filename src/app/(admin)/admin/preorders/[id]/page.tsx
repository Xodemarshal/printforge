import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Clock, Tag, Sparkles, CheckCircle2, Package } from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { getPreorderById, getPreOrderRegistrations } from "@/actions/preorders";
import { formatCurrency } from "@/lib/utils";
import type { PreOrderStatus } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const preorder = await getPreorderById(id);
  return {
    title: `${preorder?.title || "Preorder"} — Registrations | Admin`
  };
}

const STATUS_BADGE: Record<PreOrderStatus, string> = {
  DRAFT: "bg-white/10 text-cream/60 border-white/10",
  ACTIVE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  ENDED: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  SOLD_OUT: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  CANCELLED: "bg-red-900/20 text-red-400 border-red-500/30"
};

export default async function PreorderDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const [preorder, registrations] = await Promise.all([
    getPreorderById(id),
    getPreOrderRegistrations(id)
  ]);

  if (!preorder) notFound();

  const product = preorder.products;
  const originalPrice = product?.price || 0;
  const discountPct = Number(preorder.discount_percentage || 0);
  const preorderPrice = Math.round((originalPrice - (originalPrice * discountPct) / 100) * 100) / 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/admin/preorders"
          className="inline-flex items-center gap-2 text-sm text-cream/50 hover:text-cream transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Preorders</span>
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="display-font text-3xl font-bold text-emerald-400">{preorder.title}</h1>
            {product && (
              <p className="text-sm text-cream/60">
                Product: <Link href={`/products/${product.slug}`} className="text-emerald-400 hover:underline">{product.name}</Link>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${STATUS_BADGE[preorder.status]}`}>
              {preorder.status}
            </span>
            <Link
              href={`/admin/preorders/${id}/edit`}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-cream/70 hover:text-cream text-sm font-semibold transition-all"
            >
              Edit Campaign
            </Link>
          </div>
        </div>
      </div>

      {/* Campaign Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-cream/50 font-semibold">Registrations</p>
          <p className="text-3xl font-bold text-emerald-400">{preorder.registration_count || 0}</p>
          {preorder.max_quantity && (
            <p className="text-xs text-cream/40">of {preorder.max_quantity} slots</p>
          )}
        </div>
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-cream/50 font-semibold">Discount</p>
          <p className="text-3xl font-bold text-emerald-400">{discountPct}%</p>
          <p className="text-xs text-cream/40">early bird</p>
        </div>
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-cream/50 font-semibold">Locked Price</p>
          <p className="text-2xl font-bold text-emerald-400">₹{preorderPrice}</p>
          <p className="text-xs text-cream/40 line-through">₹{originalPrice}</p>
        </div>
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-cream/50 font-semibold">Deadline</p>
          <p className="text-sm font-bold text-cream">
            {new Date(preorder.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          <p className="text-xs text-cream/40">
            {new Date(preorder.end_date) < new Date() ? "Expired" : "Ongoing"}
          </p>
        </div>
      </div>

      {/* Registrations List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <Users size={16} />
          <span>Registered Users ({registrations.length})</span>
        </h2>

        {registrations.length === 0 ? (
          <div className="p-12 rounded-3xl border border-white/10 bg-white/5 text-center space-y-2">
            <p className="text-cream/40 text-sm">No users have prebooked this campaign yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10 bg-black/30">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-cream/50">User</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-cream/50">Email</th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-cream/50">Locked Price</th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-cream/50">Discount</th>
                    <th className="px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-cream/50">Status</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-cream/50">Registered At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-white/[0.02]">
                  {registrations.map(reg => (
                    <tr key={reg.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-4 text-cream font-medium">
                        {reg.users?.name || "—"}
                      </td>
                      <td className="px-5 py-4 text-cream/60 text-xs">
                        {reg.users?.email || "—"}
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-emerald-400">
                        ₹{reg.locked_price}
                      </td>
                      <td className="px-5 py-4 text-right text-cream/60">
                        {reg.discount_percentage}%
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          reg.status === "PURCHASED"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : reg.status === "CANCELLED"
                            ? "bg-red-900/20 text-red-400 border-red-500/30"
                            : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-cream/50 text-xs">
                        {new Date(reg.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
