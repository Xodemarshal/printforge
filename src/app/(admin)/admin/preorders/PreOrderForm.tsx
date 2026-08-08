"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Loader2, Calculator, IndianRupee, Percent } from "lucide-react";
import type { ProductRow, PreOrderStatus } from "@/types";
import { createPreOrderAction, updatePreOrderAction } from "@/actions/preorders";
import type { PreOrderRow } from "@/types";

interface PreOrderFormProps {
  products: ProductRow[];
  preorder?: PreOrderRow;
  mode: "create" | "edit";
}

const STATUS_OPTIONS: { value: PreOrderStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft (not visible)" },
  { value: "ACTIVE", label: "Active (live & visible)" },
  { value: "ENDED", label: "Ended" },
  { value: "SOLD_OUT", label: "Sold Out" },
  { value: "CANCELLED", label: "Cancelled" }
];

function toLocalDatetimeValue(isoString?: string | null): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type PricingMode = "fixed" | "percentage";

export function PreOrderForm({ products, preorder, mode }: PreOrderFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(
    preorder?.products || null
  );

  // Detect initial pricing mode: if preorder has an explicit preorder_price, use fixed mode
  const initialMode: PricingMode = preorder?.preorder_price != null ? "fixed" : "percentage";
  const [pricingMode, setPricingMode] = useState<PricingMode>(initialMode);

  const [discountPct, setDiscountPct] = useState<number>(
    Number(preorder?.discount_percentage || 0)
  );
  const [fixedPrice, setFixedPrice] = useState<number | "">(
    preorder?.preorder_price ?? ""
  );

  const productPrice = selectedProduct?.price || 0;

  // Derived values for live preview
  const previewLockedPrice: number = (() => {
    if (pricingMode === "fixed" && fixedPrice !== "" && fixedPrice > 0) {
      return Number(fixedPrice);
    }
    if (pricingMode === "percentage" && productPrice > 0 && discountPct > 0) {
      return Math.round((productPrice - (productPrice * discountPct) / 100) * 100) / 100;
    }
    return productPrice;
  })();

  const previewSaving = Math.max(0, Math.round((productPrice - previewLockedPrice) * 100) / 100);
  const previewDiscountPct = productPrice > 0
    ? Math.round((previewSaving / productPrice) * 10000) / 100
    : 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(event.currentTarget);

    // Enforce mode: clear the field that's not in use
    if (pricingMode === "fixed") {
      formData.set("discountPercentage", "0");
      // preorderPrice is already in the form
    } else {
      formData.delete("preorderPrice");
    }

    startTransition(async () => {
      const result = mode === "create"
        ? await createPreOrderAction(formData)
        : await updatePreOrderAction(preorder!.id, formData);

      if (result.success) {
        router.push("/admin/preorders");
      } else {
        setErrorMsg(result.error || "Unknown error occurred.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-300 text-sm font-medium">
          {errorMsg}
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
              // Reset price fields when product changes
              setFixedPrice("");
              setDiscountPct(0);
            }}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          >
            <option value="">— Select a product —</option>
            {products.map(p => (
              <option key={p.id} value={p.id} className="bg-[#0f1810]">
                {p.name} — ₹{p.price.toLocaleString("en-IN")}
              </option>
            ))}
          </select>
          {selectedProduct && (
            <p className="text-xs text-cream/50">
              Product base price: <strong className="text-cream">₹{selectedProduct.price.toLocaleString("en-IN")}</strong>
            </p>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2 lg:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
            Campaign Title *
          </label>
          <input
            name="title"
            required
            defaultValue={preorder?.title || ""}
            placeholder="e.g. Early Access — Dragon Figurine Collection"
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
            placeholder="Describe the preorder campaign…"
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
          <p className="text-[11px] text-cream/40">Leave empty to use the product image automatically.</p>
        </div>

        {/* Reservation Deposit Fee Input */}
        <div className="space-y-2 lg:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
            Priority Access Pass Token Fee (₹) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">₹</span>
            <input
              name="reservationFee"
              type="number"
              min={1}
              max={1000}
              step={1}
              required
              defaultValue={preorder?.reservation_fee ?? 10}
              placeholder="10"
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-8 pr-4 py-3 text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
            />
          </div>
          <p className="text-[11px] text-cream/50">
            The small token fee customers pay via Razorpay to get early vault access (e.g. ₹1 to ₹100). This token fee is fully credited toward their final purchase when you approve their batch.
          </p>
        </div>

        {/* ================================================================
            PRICING SECTION — Core feature: Fixed Price vs Discount %
            ================================================================ */}
        <div className="lg:col-span-2 space-y-4 p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Calculator size={16} />
              Preorder Pricing
            </h3>
            {/* Mode toggle */}
            <div className="inline-flex rounded-xl overflow-hidden border border-white/10 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPricingMode("fixed")}
                className={`flex items-center gap-1.5 px-4 py-2 transition-colors ${
                  pricingMode === "fixed"
                    ? "bg-emerald-600 text-white"
                    : "bg-white/5 text-cream/60 hover:text-cream"
                }`}
              >
                <IndianRupee size={13} />
                Fixed Price
              </button>
              <button
                type="button"
                onClick={() => setPricingMode("percentage")}
                className={`flex items-center gap-1.5 px-4 py-2 transition-colors ${
                  pricingMode === "percentage"
                    ? "bg-emerald-600 text-white"
                    : "bg-white/5 text-cream/60 hover:text-cream"
                }`}
              >
                <Percent size={13} />
                Discount %
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pricingMode === "fixed" ? (
              /* Fixed Preorder Price Input */
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-cream/70 uppercase tracking-wide">
                  Preorder Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">₹</span>
                  <input
                    name="preorderPrice"
                    type="number"
                    min={1}
                    step={0.01}
                    required={pricingMode === "fixed"}
                    value={fixedPrice}
                    onChange={e => setFixedPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
                    placeholder={productPrice > 0 ? String(productPrice) : "Enter price"}
                    className="w-full rounded-xl border border-white/10 bg-white/5 pl-8 pr-4 py-3 text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
                <p className="text-[11px] text-cream/40">
                  Set the exact price customers will pay when prebooking. Overrides any % calculation.
                </p>
                {/* Hidden discount field to avoid empty form submission */}
                <input type="hidden" name="discountPercentage" value="0" />
              </div>
            ) : (
              /* Discount Percentage Input */
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-cream/70 uppercase tracking-wide">
                  Discount Percentage (%)
                </label>
                <div className="relative">
                  <input
                    name="discountPercentage"
                    type="number"
                    min={0}
                    max={90}
                    step={0.5}
                    value={discountPct}
                    onChange={e => setDiscountPct(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 pr-10 py-3 text-cream text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream/40 text-sm font-bold">%</span>
                </div>
                <p className="text-[11px] text-cream/40">
                  Price will be calculated as: Base Price × (1 - Discount%).
                </p>
              </div>
            )}

            {/* Live Price Preview */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-cream/70 uppercase tracking-wide">Live Price Preview</p>
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-cream/50">Base Price:</span>
                  <span className="text-cream font-medium">
                    {productPrice > 0 ? `₹${productPrice.toLocaleString("en-IN")}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-cream/50">Customer Saves:</span>
                  <span className="text-emerald-400 font-semibold">
                    {previewSaving > 0
                      ? `₹${previewSaving.toLocaleString("en-IN")} (${previewDiscountPct}% off)`
                      : "—"}
                  </span>
                </div>
                <div className="pt-1.5 border-t border-white/10 flex justify-between">
                  <span className="text-xs font-bold text-cream/70">Locked Preorder Price:</span>
                  <span className="text-base font-bold text-emerald-400">
                    {productPrice > 0 ? `₹${previewLockedPrice.toLocaleString("en-IN")}` : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Max Slots */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
            Max Preorder Slots
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

        {/* Status */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
            Campaign Status *
          </label>
          <select
            name="status"
            defaultValue={preorder?.status || "ACTIVE"}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-[#0f1810]">{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
            Campaign Start *
          </label>
          <input
            name="startDate"
            type="datetime-local"
            required
            defaultValue={
              toLocalDatetimeValue(preorder?.start_date) ||
              toLocalDatetimeValue(new Date().toISOString())
            }
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
            Campaign Deadline *
          </label>
          <input
            name="endDate"
            type="datetime-local"
            required
            defaultValue={
              toLocalDatetimeValue(preorder?.end_date) ||
              toLocalDatetimeValue(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString())
            }
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>

      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={() => router.push("/admin/preorders")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-cream/70 hover:text-cream hover:bg-white/5 text-sm font-semibold transition-all"
        >
          <ArrowLeft size={16} />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all disabled:opacity-50 shadow-md shadow-emerald-950/40"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {mode === "create" ? "Create Campaign" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
