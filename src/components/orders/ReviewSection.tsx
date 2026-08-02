"use client";

import { useState, useTransition } from "react";
import { Star, CheckCircle2, Loader2, Send, MessageSquare } from "lucide-react";
import { submitProductReviewAction } from "@/actions/productReviews";
import { useToast } from "@/hooks/useToast";

interface ReviewSectionProps {
  orderId: string;
  orderItems: Array<{ id: string; product_id: string; name: string }>;
  reviewedList: Array<{ product_id: string; rating: number; review_text: string }>;
}

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent ✨"];
const STAR_COLORS = [
  "",
  "text-red-400",
  "text-orange-400",
  "text-yellow-400",
  "text-lime-500",
  "text-green-500",
];

function StarPicker({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(n)}
            onMouseEnter={() => !disabled && setHover(n)}
            onMouseLeave={() => !disabled && setHover(0)}
            aria-label={`Rate ${n} out of 5 stars`}
            className={`transition-all duration-100 ${
              disabled ? "cursor-not-allowed opacity-40" : "hover:scale-125 cursor-pointer"
            }`}
          >
            <Star
              size={32}
              strokeWidth={1.5}
              className={
                n <= active
                  ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                  : "text-white/20 fill-transparent"
              }
            />
          </button>
        ))}
      </div>
      {/* Label */}
      <div className="h-5">
        {active > 0 && (
          <span
            className={`text-sm font-semibold tracking-wide ${STAR_COLORS[active]}`}
          >
            {STAR_LABELS[active]}
          </span>
        )}
      </div>
    </div>
  );
}

function ReviewCard({
  item,
  orderId,
  initialReview,
}: {
  item: { id: string; product_id: string; name: string };
  orderId: string;
  initialReview: { rating: number; review_text: string } | null;
}) {
  const { success, error: showError } = useToast();
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(initialReview?.rating ?? 0);
  const [text, setText] = useState(initialReview?.review_text ?? "");
  const [submitted, setSubmitted] = useState(!!initialReview);

  const charCount = text.trim().length;

  const handleSubmit = () => {
    if (rating < 1) {
      showError("Rating required", "Click a star to rate this product.");
      return;
    }
    if (charCount < 10) {
      showError("Review too short", "Please write at least 10 characters.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("productId", item.product_id);
      formData.append("orderId", orderId);
      formData.append("rating", String(rating));
      formData.append("reviewText", text.trim());

      const result = await submitProductReviewAction(formData);

      if (result.success) {
        setSubmitted(true);
        success(
          "Review Submitted! 🎉",
          "Your review is pending approval and will appear on the product page shortly."
        );
      } else {
        showError("Couldn't Submit", result.error || "Something went wrong. Please try again.");
      }
    });
  };

  /* ─── Success State ─── */
  if (submitted) {
    return (
      <div className="relative overflow-hidden bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 size={22} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-emerald-300 text-sm">{item.name}</p>
            <p className="text-emerald-400/80 text-xs mt-0.5 font-medium">
              ✓ Review submitted — pending approval
            </p>
            <div className="flex gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={13}
                  className={
                    n <= rating
                      ? "text-amber-400 fill-amber-400"
                      : "text-emerald-800 fill-emerald-800"
                  }
                />
              ))}
            </div>
            {text && (
              <p className="mt-2.5 text-xs text-emerald-200/90 italic border-l-2 border-emerald-500/40 pl-2 leading-relaxed break-words">
                "{text}"
              </p>
            )}
          </div>
        </div>
        {/* Decorative checkmark watermark */}
        <CheckCircle2
          size={80}
          className="absolute -right-4 -bottom-4 text-emerald-500/10 pointer-events-none"
        />
      </div>
    );
  }

  /* ─── Review Form ─── */
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-sm backdrop-blur-md">
      {/* Product name header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-white/5 border-b border-white/10">
        <MessageSquare size={15} className="text-cream/40 shrink-0" />
        <span className="font-semibold text-cream text-sm truncate">{item.name}</span>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Star Picker */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cream/40 mb-2">
            Your Rating
          </p>
          <StarPicker
            value={rating}
            onChange={setRating}
            disabled={isPending}
          />
        </div>

        {/* Text Area */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cream/40 mb-2">
            Your Review
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isPending}
            placeholder="Share your experience — print quality, accuracy, packaging, speed..."
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 border border-white/10 rounded-xl text-sm bg-black/30 text-cream placeholder:text-cream/30 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 resize-none transition-all disabled:opacity-50"
          />
          {/* Character counter */}
          <div className="flex justify-between items-center mt-1.5 px-0.5">
            <p
              className={`text-xs transition-colors ${
                charCount === 0
                  ? "text-cream/30"
                  : charCount < 10
                  ? "text-red-400 font-medium"
                  : "text-emerald-400"
              }`}
            >
              {charCount < 10
                ? `${Math.max(0, 10 - charCount)} more characters needed`
                : `${charCount} characters ✓`}
            </p>
            <p className="text-xs text-cream/30">{charCount}/500</p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || rating < 1 || charCount < 10}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 ${
            isPending || rating < 1 || charCount < 10
              ? "bg-white/10 text-cream/30 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-md active:scale-[0.98]"
          }`}
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Send size={16} />
              Submit Review
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function ReviewSection({ orderId, orderItems, reviewedList }: ReviewSectionProps) {
  const reviewableItems = orderItems.filter((item) => item.product_id);
  if (reviewableItems.length === 0) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5 backdrop-blur-md">
      {/* Section header */}
      <div>
        <h2 className="text-xl font-bold text-cream">
          Rate Your Purchase
        </h2>
        <p className="text-sm text-cream/60 mt-0.5">
          Your honest review helps other customers and supports our craftspeople.
        </p>
      </div>

      {/* One card per product */}
      <div className="space-y-4">
        {reviewableItems.map((item) => {
          const matchedReview = reviewedList.find(
            (r) => r.product_id === item.product_id
          );
          return (
            <ReviewCard
              key={item.product_id}
              item={item}
              orderId={orderId}
              initialReview={
                matchedReview
                  ? { rating: matchedReview.rating, review_text: matchedReview.review_text }
                  : null
              }
            />
          );
        })}
      </div>
    </div>
  );
}
