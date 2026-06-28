import { requireAdmin } from '@/lib/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import BusinessHealthDashboard from './BusinessHealthDashboard';

export const metadata = {
  title: 'Business Health - PrintForge Admin',
  description: 'Monitor overall business health score'
};

async function getHealthData() {
  const supabase = createAdminClient();

  const { data: latest } = await supabase
    .from('business_health_snapshots')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: trend } = await supabase
    .from('business_health_snapshots')
    .select('health_score, health_category, created_at')
    .order('created_at', { ascending: true })
    .limit(30);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount, profit_margin, created_at')
    .eq('payment_status', 'paid')
    .gte('created_at', sixtyDaysAgo);

  const { data: customers } = await supabase
    .from('customers')
    .select('total_orders');

  const { data: reviews } = await supabase
    .from('product_reviews')
    .select('rating')
    .eq('approved', true);

  const last30 = (orders || []).filter((o: any) => o.created_at >= thirtyDaysAgo);
  const prev30 = (orders || []).filter((o: any) => o.created_at < thirtyDaysAgo);

  const currentRevenue = last30.reduce((s: number, o: any) => s + Number(o.total_amount), 0);
  const previousRevenue = prev30.reduce((s: number, o: any) => s + Number(o.total_amount), 0);
  const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  const avgMargin = last30.length > 0 ? last30.reduce((s: number, o: any) => s + Number(o.profit_margin || 0), 0) / last30.length : 0;

  const allCustomers = customers || [];
  const retentionRate = allCustomers.length > 0
    ? (allCustomers.filter((c: any) => c.total_orders > 1).length / allCustomers.length) * 100
    : 0;

  const allReviews = reviews || [];
  const avgRating = allReviews.length > 0
    ? allReviews.reduce((s: number, r: any) => s + r.rating, 0) / allReviews.length
    : 0;

  return {
    latest,
    trend: trend || [],
    liveMetrics: {
      currentRevenue,
      revenueGrowth,
      avgMargin,
      retentionRate,
      avgRating,
      totalOrders: last30.length,
      totalCustomers: allCustomers.length,
      totalReviews: allReviews.length
    }
  };
}

export default async function BusinessHealthPage() {
  await requireAdmin();
  const data = await getHealthData();
  return <BusinessHealthDashboard data={data} />;
}
