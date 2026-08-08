"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Loader2, Package } from "lucide-react";
import type { ProductRow, PreOrderStatus } from "@/types";
import { createPreOrderAction, updatePreOrderAction } from "@/actions/preorders";
import type { PreOrderRow } from "@/types";

interface PreOrderFormProps {
  products: ProductRow[];
  preorder?: PreOrderRow;
  mode: "create" | "edit";
}

const STATUS_OPTIONS: { value: PreOrderStatus; label: string; color: string }[] = [
  { value: "DRAFT", label: "Draft", color: "text-cream/60" },
  { value: "ACTIVE", label: "Active", color: "text-emerald-400" },
  { value: "ENDED", label: "Ended", color: "text-amber-400" },
  { value: "SOLD_OUT", label: "Sold Out", color: "text-orange-400" },
  { value: "CANCELLED", label: "Cancelled", color: "text-red-400" }
];

function toLocalDatetimeValue(isoString?: string | null): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PreOrderForm({ products, preorder, mode }: PreOrderFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(
    preorder?.products || null
  );
  const [discountPct, setDiscountPct] = useState(preorder?.discount_percentage || 0);

  const originalPrice = selectedProduct?.price || 0;
  const preorderPrice = originalPrice > 0 ? Math.round((originalPrice - (originalPrice * Number(discountPct)) / 100) * 100) / 100 : 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = mode === "create"
        ? await createPreOrderAction(formData)
        : await updatePreOrderAction(preorder!.id, formData);

      if (result.success) {
        router.push("/admin/preorders");
      } else {
        setError(result.error || "Unknown error occurred.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Selector */}
        <div className="space-y-2 lg:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
            Target Product *
          </label>
          <select
            name="productId"
            required
            defaultValue={preorder?.product_id || ""}
            onChange={(e) => {
              const p = products.find(x => x.id === e.target.value) || null;
              setSelectedProduct(p);
            }}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          >
            <option value="">— Select a product —</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} — ₹{p.price}
              </option>
            ))}
          </select>
          {selectedProduct && (
            <p className="text-xs text-cream/50">
              Base Price: <strong className="text-cream">₹{selectedProduct.price}</strong>
            </p>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2 lg:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
            Preorder Campaign Title *
          </label>
          <input
            name="title"
            required
            defaultValue={preorder?.title || ""}
            placeholder="e.g. Early Access: Dragon Figurine Collection"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>

        {/* Description */}
        <div className="space-y-2 lg:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            defaultValue={preorder?.description || ""}
            placeholder="Describe the preorder campaign, what the product is, and why customers should prebook now…"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 resize-none"
          />
        </div>

        {/* Banner URL */}
        <div className="space-y-2 lg:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
            Banner / Hero Image URL
          </label>
          <input
            name="bannerUrl"
            type="url"
            defaultValue={preorder?.banner_url || ""}
            placeholder="https://your-cdn.com/preorder-banner.jpg"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          />
          <p className="text-[11px] text-cream/40">Leave empty to use the product&apos;s image automatically.</p>
        </div>

        {/* Discount Percentage */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
            Discount Percentage *
          </label>
          <input
            name="discountPercentage"
            type="number"
            required
            min={0}
            max={90}
            step={0.5}
            value={discountPct}
            onChange={e => setDiscountPct(parseFloat(e.target.value) || 0)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          />
          {selectedProduct && discountPct > 0 && (
            <p className="text-xs">
              <span className="text-cream/50">Customers will pay: </span>
              <strong className="text-emerald-400">₹{preorderPrice}</strong>
              <span className="text-cream/40 ml-2 line-through">₹{originalPrice}</span>
            </p>
          )}
        </div>

        {/* Max Quantity / Slots */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
            Maximum Preorder Slots
          </label>
          <input
            name="maxQuantity"
            type="number"
            min={1}
            defaultValue={preorder?.max_quantity ?? ""}
            placeholder="Leave empty for unlimited"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
            Campaign Start Date *
          </label>
          <input
            name="startDate"
            type="datetime-local"
            required
            defaultValue={toLocalDatetimeValue(preorder?.start_date)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
            Campaign End Date (Deadline) *
          </label>
          <input
            name="endDate"
            type="datetime-local"
            required
            defaultValue={toLocalDatetimeValue(preorder?.end_date)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
            Campaign Status
          </label>
          <select
            name="status"
            defaultValue={preorder?.status || "DRAFT"}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={() => router.push("/admin/preorders")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-cream/70 hover:text-cream hover:bg-white/5 text-sm font-semibold transition-all"
        >
          <ArrowLeft size={16} />
          <span>Cancel</span>
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all disabled:opacity-50 shadow-md shadow-emerald-950/40"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>{mode === "create" ? "Create Preorder Campaign" : "Save Changes"}</span>
        </button>
      </div>
    </form>
  );
}
