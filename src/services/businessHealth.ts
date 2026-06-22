import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Calculate and store business health score
 */
export async function calculateBusinessHealth() {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase.rpc('calculate_business_health_score');

    if (error) throw error;

    const healthScore = data as number;
    const healthCategory = getHealthCategory(healthScore);

    // Store snapshot
    await supabase.from('business_health_snapshots').insert({
      health_score: healthScore,
      health_category: healthCategory,
      metrics: await getDetailedMetrics()
    });

    return {
      success: true,
      healthScore,
      healthCategory
    };
  } catch (error: any) {
    console.error('Calculate business health error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get health category from score
 */
function getHealthCategory(score: number): 'critical' | 'warning' | 'good' | 'excellent' {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'warning';
  return 'critical';
}

/**
 * Get detailed metrics for snapshot
 */
async function getDetailedMetrics() {
  const supabase = createAdminClient();

  // Revenue growth
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .eq('payment_status', 'paid')
    .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString());

  const last30Days = revenueData?.filter(
    o => new Date(o.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ) || [];
  const previous30Days = revenueData?.filter(
    o => new Date(o.created_at) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ) || [];

  const currentRevenue = last30Days.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const previousRevenue = previous30Days.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  // Conversion rate
  const { data: events } = await supabase
    .from('analytics_events')
    .select('event_name')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const views = events?.filter(e => e.event_name === 'product_view').length || 1;
  const purchases = events?.filter(e => e.event_name === 'payment_success').length || 0;
  const conversionRate = (purchases / views) * 100;

  // Customer retention
  const { data: customers } = await supabase
    .from('customers')
    .select('total_orders');

  const repeatingCustomers = customers?.filter(c => c.total_orders > 1).length || 0;
  const totalCustomers = customers?.length || 1;
  const retentionRate = (repeatingCustomers / totalCustomers) * 100;

  // Review rating
  const { data: reviews } = await supabase
    .from('product_reviews')
    .select('rating')
    .eq('approved', true);

  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Cart recovery
  const { data: carts } = await supabase
    .from('cart_sessions')
    .select('abandoned, recovered')
    .eq('abandoned', true)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const abandonedCarts = carts?.length || 1;
  const recoveredCarts = carts?.filter(c => c.recovered).length || 0;
  const recoveryRate = (recoveredCarts / abandonedCarts) * 100;

  // Profit margin
  const { data: orders } = await supabase
    .from('orders')
    .select('profit_margin')
    .eq('payment_status', 'paid')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const avgProfitMargin = orders && orders.length > 0
    ? orders.reduce((sum, o) => sum + Number(o.profit_margin || 0), 0) / orders.length
    : 0;

  return {
    revenueGrowth,
    conversionRate,
    retentionRate,
    avgRating,
    recoveryRate,
    avgProfitMargin
  };
}

/**
 * Get latest business health
 */
export async function getLatestBusinessHealth() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('business_health_snapshots')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Get latest business health error:', error);
    return null;
  }

  return data;
}

/**
 * Get business health trend
 */
export async function getBusinessHealthTrend(days: number = 30) {
  const supabase = createAdminClient();

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('business_health_snapshots')
    .select('*')
    .gte('created_at', startDate)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Get business health trend error:', error);
    return [];
  }

  return data || [];
}
