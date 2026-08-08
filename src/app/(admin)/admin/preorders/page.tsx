import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Calendar, Users, Tag, Edit2, ToggleLeft, ToggleRight, ChevronRight } from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { getAdminPreorders } from "@/actions/preorders";
import type { PreOrderRow, PreOrderStatus } from "@/types";
import { PreOrderStatusToggle } from "./PreOrderStatusToggle";

export const metadata: Metadata = {
  title: "Preorder Campaigns | Admin — ArchiveVault"
};

const STATUS_BADGE: Record<PreOrderStatus, string> = {
  DRAFT: "bg-white/10 text-cream/60 border-white/10",
  ACTIVE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  ENDED: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  SOLD_OUT: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  CANCELLED: "bg-red-900/20 text-red-400 border-red-500/30"
};

export default async function PreordersPage() {
  await requireAdmin();
  const preorders = await getAdminPreorders();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="display-font text-3xl font-bold text-emerald-400">Preorder Campaigns</h1>
          <p className="text-sm text-cream/60">
            Manage exclusive early-access preorder campaigns for your products.
          </p>
        </div>
        <Link
          href="/admin/preorders/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all shadow-md shadow-emerald-950/40"
        >
          <Plus size={16} />
          <span>New Campaign</span>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["ACTIVE", "DRAFT", "ENDED", "SOLD_OUT"] as PreOrderStatus[]).map(status => {
          const count = preorders.filter(p => p.status === status).length;
          return (
            <div key={status} className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md text-center space-y-1">
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_BADGE[status]}`}>
                {status}
              </span>
              <p className="text-2xl font-bold text-cream">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Preorders Table/List */}
      {preorders.length === 0 ? (
        <div className="p-16 rounded-3xl border border-white/10 bg-white/5 text-center space-y-4">
          <p className="text-cream/40 text-sm">No preorder campaigns created yet.</p>
          <Link
            href="/admin/preorders/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all"
          >
            <Plus size={14} />
            <span>Create First Campaign</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {preorders.map(preorder => (
            <PreorderRow key={preorder.id} preorder={preorder} />
          ))}
        </div>
      )}
    </div>
  );
}

function PreorderRow({ preorder }: { preorder: PreOrderRow }) {
  const product = preorder.products;
  const discountPct = Number(preorder.discount_percentage || 0);
  const originalPrice = product?.price || 0;
  const preorderPrice = Math.round((originalPrice - (originalPrice * discountPct) / 100) * 100) / 100;
  const isExpired = new Date(preorder.end_date) < new Date();
  const image = preorder.banner_url || product?.image_url;

  const STATUS_BADGE_MAP: Record<PreOrderStatus, string> = {
    DRAFT: "bg-white/10 text-cream/60 border-white/10",
    ACTIVE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    ENDED: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    SOLD_OUT: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    CANCELLED: "bg-red-900/20 text-red-400 border-red-500/30"
  };

  return (
    <div className="flex gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:border-emerald-500/20 transition-all">
      {/* Thumbnail */}
      {image && (
        <div className="hidden sm:block w-20 h-16 rounded-xl overflow-hidden bg-black/40 shrink-0">
          <img src={image} alt={preorder.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5 min-w-0">
            <h3 className="font-bold text-cream text-sm truncate">{preorder.title}</h3>
            {product && (
              <p className="text-xs text-cream/50 truncate">Product: {product.name}</p>
            )}
          </div>
          <span className={`shrink-0 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE_MAP[preorder.status]}`}>
            {preorder.status}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-cream/60">
          <span className="flex items-center gap-1.5">
            <Tag size={12} className="text-emerald-400" />
            {discountPct}% off — Locked at ₹{preorderPrice}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={12} className="text-emerald-400" />
            {preorder.registration_count || 0}{preorder.max_quantity ? ` / ${preorder.max_quantity}` : ""} registrations
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-emerald-400" />
            Ends {new Date(preorder.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            {isExpired && <span className="text-red-400 ml-1">(Expired)</span>}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <PreOrderStatusToggle preorderId={preorder.id} currentStatus={preorder.status} />

        <Link
          href={`/admin/preorders/${preorder.id}`}
          className="p-2 rounded-xl border border-white/10 text-cream/60 hover:text-cream hover:bg-white/5 transition-all"
          title="View Registrations"
        >
          <Users size={16} />
        </Link>

        <Link
          href={`/admin/preorders/${preorder.id}/edit`}
          className="p-2 rounded-xl border border-white/10 text-cream/60 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
          title="Edit"
        >
          <Edit2 size={16} />
        </Link>
      </div>
    </div>
  );
}
