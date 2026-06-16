import { createAdminClient } from "@/lib/supabase/admin";
import { deleteReviewAction, updateReviewVisibilityAction } from "@/actions/reviews";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/Button";

export default async function ReviewsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("reviews").select("*").limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Reviews</h1>
      <AdminDataTable
        columns={["Product", "Rating", "Comment", "Actions"]}
        rows={(data ?? []).map((review: any) => [
          review.product_id,
          review.rating,
          review.comment,
          <div key={review.id} className="flex gap-2">
            <form 
              action={async (formData) => {
                "use server";
                await updateReviewVisibilityAction(formData);
              }}
            >
              <input type="hidden" name="id" value={review.id} />
              <input type="hidden" name="hidden" value={String(!review.hidden)} />
              <Button type="submit" variant="outline">
                {review.hidden ? "Show" : "Hide"}
              </Button>
            </form>
            <form 
              action={async (formData) => {
                "use server";
                await deleteReviewAction(formData);
              }}
            >
              <input type="hidden" name="id" value={review.id} />
              <Button type="submit" variant="outline">Delete</Button>
            </form>
          </div>
        ])}
      />
    </div>
  );
}
