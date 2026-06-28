import { createAdminClient } from "@/lib/supabase/admin";
import { deleteReviewAction, updateReviewVisibilityAction } from "@/actions/reviews";
import { Star, Eye, EyeOff, Trash2, MessageSquare } from "lucide-react";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={13}
          className={n <= rating ? "text-[#D4A017] fill-[#D4A017]" : "text-gray-800"}
        />
      ))}
    </span>
  );
}

export default async function ReviewsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, products(id, name)")
    .order("created_at", { ascending: false })
    .limit(100);

  const reviews = data ?? [];
  const visible = reviews.filter((r: any) => !r.hidden).length;
  const avgRating = reviews.length > 0
    ? reviews.reduce((s: number, r: any) => s + Number(r.rating), 0) / reviews.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white">Reviews (Legacy)</h1>
        <p className="text-gray-400 text-sm">Old review system — show/hide and delete customer reviews.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-2xl font-bold text-white">{reviews.length}</p>
          <p className="text-gray-500 text-xs mt-1">Total Reviews</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-2xl font-bold text-white">{visible}</p>
          <p className="text-gray-500 text-xs mt-1">Visible</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-[#D4A017]">{avgRating.toFixed(1)}</p>
            <Star size={18} className="text-[#D4A017] fill-[#D4A017]" />
          </div>
          <p className="text-gray-500 text-xs mt-1">Avg Rating</p>
        </div>
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-16 text-center border border-gray-800">
          <MessageSquare size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review: any) => (
            <div
              key={review.id}
              className={`bg-gray-900 rounded-xl p-5 border border-gray-800 border-l-4 transition-all ${
                review.hidden
                  ? "border-l-gray-600 opacity-60"
                  : "border-l-[#D4A017]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <StarDisplay rating={Number(review.rating)} />
                    <span className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </span>
                    {review.hidden && (
                      <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full">Hidden</span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-200 text-sm mb-1">
                    {(review.products as any)?.name || `Product: ${review.product_id?.slice(0, 8)}…`}
                  </p>
                  {review.comment && (
                    <p className="text-gray-400 text-sm italic line-clamp-3">"{review.comment}"</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <form action={async (formData) => {
                    "use server";
                    await updateReviewVisibilityAction(formData);
                    revalidatePath("/admin/reviews");
                  }}>
                    <input type="hidden" name="id" value={review.id} />
                    <input type="hidden" name="hidden" value={String(!review.hidden)} />
                    <button type="submit"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        review.hidden
                          ? "bg-green-950/40 text-green-400 border border-green-900/60 hover:bg-green-900/40"
                          : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
                      }`}>
                      {review.hidden ? <Eye size={13} /> : <EyeOff size={13} />}
                      {review.hidden ? "Show" : "Hide"}
                    </button>
                  </form>

                  <form action={async (formData) => {
                    "use server";
                    await deleteReviewAction(formData);
                    revalidatePath("/admin/reviews");
                  }}>
                    <input type="hidden" name="id" value={review.id} />
                    <button type="submit"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-950/40 text-red-400 border border-red-900/60 hover:bg-red-900/40 transition-colors">
                      <Trash2 size={13} /> Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
