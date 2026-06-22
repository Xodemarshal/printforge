import { requireAdmin } from '@/lib/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import AnalyticsDashboard from './AnalyticsDashboard';

export const metadata = {
  title: 'Analytics Dashboard - PrintForge Admin',
  description: 'Business analytics and KPIs'
};

async function getAnalyticsData(days: number = 30) {
  const supabase = createAdminClient();
  
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Revenue stats
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('payment_status', 'paid')
    .gte('created_at', startDate);

  const totalRevenue = orders?.reduce((sum:any, o:any) => sum + Number(o.total_amount), 0) || 0;
  const totalOrders = orders?.length || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Today's revenue
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaysOrders = orders?.filter(o => new Date(o.created_at) >= todayStart) || [];
  const revenueToday = todaysOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  // Customer stats
  const { data: customers } = await supabase
    .from('customers')
    .select('*');

  const totalCustomers = customers?.length || 0;
  const newCustomers = customers?.filter(c => 
    new Date(c.created_at) >= new Date(startDate)
  ).length || 0;
  const returningCustomers = customers?.filter(c => c.total_orders > 1).length || 0;

  // Product performance
  const { data: productPerformance } = await supabase
    .rpc('get_product_performance', { days });

  // Conversion funnel
  const { data: conversionFunnel } = await supabase
    .rpc('get_conversion_funnel', { days });

  // Abandoned carts
  const { data: abandonedCarts } = await supabase
    .from('cart_sessions')
    .select('*')
    .eq('abandoned', true)
    .gte('created_at', startDate);

  const totalAbandoned = abandonedCarts?.length || 0;
  const recoveredCarts = abandonedCarts?.filter(c => c.recovered).length || 0;
  const recoveredRevenue = abandonedCarts
    ?.filter(c => c.recovered)
    .reduce((sum, c) => sum + Number(c.cart_value), 0) || 0;

  // Analytics events
  const { data: events } = await supabase
    .from('analytics_events')
    .select('*')
    .gte('created_at', startDate);

  const whatsappClicks = events?.filter(e => e.event_name === 'whatsapp_click').length || 0;
  const contactFormSubmits = events?.filter(e => e.event_name === 'contact_form_submit').length || 0;

  // Top customers
  const { data: topCustomers } = await supabase
    .from('customers')
    .select('*')
    .order('total_spent', { ascending: false })
    .limit(10);

  // Conversion rate
  const productViews = events?.filter(e => e.event_name === 'product_view').length || 1;
  const purchases = events?.filter(e => e.event_name === 'payment_success').length || 0;
  const conversionRate = productViews > 0 ? (purchases / productViews) * 100 : 0;

  return {
    overview: {
      totalRevenue,
      revenueToday,
      totalOrders,
      avgOrderValue,
      conversionRate,
      totalCustomers,
      newCustomers,
      returningCustomers,
      totalAbandoned,
      recoveredCarts,
      recoveredRevenue,
      whatsappClicks,
      contactFormSubmits
    },
    productPerformance: productPerformance || [],
    conversionFunnel: conversionFunnel || [],
    topCustomers: topCustomers || [],
    orders: orders || []
  };
}
export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;

  const days = parseInt(params.days || '30', 10);

  const data = await getAnalyticsData(days);

  return (
    <AnalyticsDashboard
      data={data}
      days={days}
    />
  );
}