import { requireAdmin } from '@/lib/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import ProductReviewsDashboard from './ProductReviewsDashboard';

export const metadata = {
  title: 'Product Reviews - PrintForge Admin',
  description: 'Approve and manage customer product reviews'
};

async function getReviewsData() {
  const supabase = createAdminClient();

  const { data: reviews } = await supabase
    .from('product_reviews')
    .select('*, products(id, name), customers(id, name, email)')
    .order('created_at', { ascending: false });

  const allReviews = reviews || [];
  const pending = allReviews.filter((r: any) => !r.approved);
  const approved = allReviews.filter((r: any) => r.approved);
  const avgRating =
    approved.length > 0
      ? approved.reduce((s: number, r: any) => s + r.rating, 0) / approved.length
      : 0;

  const ratingDist = [5, 4, 3, 2, 1].map((n) => ({
    rating: n,
    count: approved.filter((r: any) => r.rating === n).length
  }));

  const { data: deliveredOrders } = await supabase
    .from('orders')
    .select('id, customer_name, customer_email')
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: false })
    .limit(50);

  return {
    stats: {
      total: allReviews.length,
      pending: pending.length,
      approved: approved.length,
      avgRating
    },
    pendingReviews: pending,
    approvedReviews: approved,
    ratingDist,
    deliveredOrders: deliveredOrders || []
  };
}

export default async function ProductReviewsPage() {
  await requireAdmin();
  const data = await getReviewsData();
  return <ProductReviewsDashboard data={data} />;
}
