import { requireAdmin } from '@/lib/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import AnalyticsDashboard from './AnalyticsDashboard';

export const metadata = {
  title: 'Analytics Dashboard - PrintForge Admin',
  description: 'Business analytics and KPIs'
};

async function getAnalyticsData(days: number = 30) {
  const supabase = createAdminClient();

  const now = Date.now();
  const startDate = new Date(now - days * 24 * 60 * 60 * 1000).toISOString();
  const prevStartDate = new Date(now - days * 2 * 24 * 60 * 60 * 1000).toISOString();

  try {
    // ── Current period orders ──────────────────────────────────────────
    const { data: orders } = await supabase
      .from('orders')
      .select('id, total_amount, profit_amount, profit_margin, total_cost, created_at, customer_name, customer_email')
      .eq('payment_status', 'paid')
      .gte('created_at', startDate)
      .order('created_at', { ascending: true });

    // ── Previous period orders (for % change) ─────────────────────────
    const { data: prevOrders } = await supabase
      .from('orders')
      .select('id, total_amount, profit_amount, total_cost')
      .eq('payment_status', 'paid')
      .gte('created_at', prevStartDate)
      .lt('created_at', startDate);

    const currentOrders = orders || [];
    const previousOrders = prevOrders || [];

    // Current period metrics
    const totalRevenue = currentOrders.reduce((s, o) => s + Number(o.total_amount), 0);
    const totalOrders = currentOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalProfit = currentOrders.reduce((s, o) => s + Number(o.profit_amount || 0), 0);
    const totalCost = currentOrders.reduce((s, o) => s + Number(o.total_cost || 0), 0);
    const avgProfitMargin = totalOrders > 0
      ? currentOrders.reduce((s, o) => s + Number(o.profit_margin || 0), 0) / totalOrders
      : 0;

    // Previous period metrics
    const prevRevenue = previousOrders.reduce((s, o) => s + Number(o.total_amount), 0);
    const prevProfit = previousOrders.reduce((s, o) => s + Number(o.profit_amount || 0), 0);
    const prevOrders_ = previousOrders.length;

    // % changes (null if no previous data)
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : null;
    const ordersChange = prevOrders_ > 0 ? ((totalOrders - prevOrders_) / prevOrders_) * 100 : null;
    const profitChange = prevProfit > 0 ? ((totalProfit - prevProfit) / prevProfit) * 100 : null;

    // Today's revenue
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaysOrders = currentOrders.filter(o => new Date(o.created_at) >= todayStart);
    const revenueToday = todaysOrders.reduce((s, o) => s + Number(o.total_amount), 0);

    // ── Daily revenue chart data ───────────────────────────────────────
    const dailyMap: Record<string, { revenue: number; profit: number; orders: number }> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(now - (days - 1 - i) * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      dailyMap[key] = { revenue: 0, profit: 0, orders: 0 };
    }
    currentOrders.forEach(o => {
      const key = o.created_at.split('T')[0];
      if (dailyMap[key]) {
        dailyMap[key].revenue += Number(o.total_amount);
        dailyMap[key].profit += Number(o.profit_amount || 0);
        dailyMap[key].orders += 1;
      }
    });
    const dailyRevenue = Object.entries(dailyMap).map(([date, vals]) => ({ date, ...vals }));

    // ── Customers ─────────────────────────────────────────────────────
    const { data: customers } = await supabase
      .from('customers')
      .select('id, name, email, total_orders, total_spent, last_order_date, created_at');

    const allCustomers = customers || [];
    const totalCustomers = allCustomers.length;
    const newCustomers = allCustomers.filter(c => c.created_at >= startDate).length;
    const returningCustomers = allCustomers.filter(c => c.total_orders > 1).length;

    const topCustomers = [...allCustomers]
      .sort((a, b) => Number(b.total_spent) - Number(a.total_spent))
      .slice(0, 10);

    // ── Analytics events (conversion funnel) ──────────────────────────
    const { data: events } = await supabase
      .from('analytics_events')
      .select('event_name, product_id, order_id, revenue, created_at')
      .gte('created_at', startDate);

    const eventsArr = events || [];
    const productViews = eventsArr.filter(e => e.event_name === 'product_view').length || 1;
    const addToCarts = eventsArr.filter(e => e.event_name === 'add_to_cart').length;
    const checkoutsStarted = eventsArr.filter(e => e.event_name === 'checkout_started').length;
    const eventPurchases = eventsArr.filter(e => e.event_name === 'payment_success').length;
    // Use actual order count as fallback for purchases (more reliable)
    const purchases = Math.max(eventPurchases, totalOrders);
    const conversionRate = productViews > 0 ? (purchases / productViews) * 100 : 0;

    const whatsappClicks = eventsArr.filter(e => e.event_name === 'whatsapp_click').length;
    const contactFormSubmits = eventsArr.filter(e => e.event_name === 'contact_form_submit').length;

    const conversionFunnel = [
      { step: 'product_view', count: productViews, pct: 100 },
      { step: 'add_to_cart', count: addToCarts, pct: productViews > 0 ? (addToCarts / productViews) * 100 : 0 },
      { step: 'checkout_started', count: checkoutsStarted, pct: productViews > 0 ? (checkoutsStarted / productViews) * 100 : 0 },
      { step: 'purchased', count: purchases, pct: productViews > 0 ? (purchases / productViews) * 100 : 0 }
    ];

    // ── Product performance from orders (reliable, no RPC needed) ─────
    const productMap: Record<string, { name: string; revenue: number; profit: number; orders: number; cost: number }> = {};
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('unit_price, quantity, products(id, name), order_id')
      .in('order_id', currentOrders.map(o => o.id));

    (orderItems || []).forEach((item: any) => {
      const name = item.products?.name || 'Unknown';
      const id = item.products?.id || 'unknown';
      const rev = Number(item.unit_price) * Number(item.quantity);
      if (!productMap[id]) {
        productMap[id] = { name, revenue: 0, profit: 0, orders: 0, cost: 0 };
      }
      productMap[id].revenue += rev;
      productMap[id].orders += 1;
    });

    const productPerformance = Object.entries(productMap)
      .map(([id, p]) => ({
        product_id: id,
        product_name: p.name,
        revenue: p.revenue,
        orders: p.orders,
        conversion_rate: productViews > 0 ? ((p.orders / productViews) * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // ── Abandoned carts ────────────────────────────────────────────────
    const { data: abandonedCarts } = await supabase
      .from('cart_sessions')
      .select('id, recovered, cart_value')
      .eq('abandoned', true)
      .gte('created_at', startDate);

    const totalAbandoned = abandonedCarts?.length || 0;
    const recoveredCarts = abandonedCarts?.filter(c => c.recovered).length || 0;
    const recoveredRevenue = abandonedCarts
      ?.filter(c => c.recovered)
      .reduce((s, c) => s + Number(c.cart_value || 0), 0) || 0;

    return {
      overview: {
        totalRevenue,
        revenueToday,
        totalOrders,
        avgOrderValue,
        totalProfit,
        totalCost,
        avgProfitMargin,
        conversionRate,
        totalCustomers,
        newCustomers,
        returningCustomers,
        totalAbandoned,
        recoveredCarts,
        recoveredRevenue,
        whatsappClicks,
        contactFormSubmits,
        // Period changes
        revenueChange,
        ordersChange,
        profitChange
      },
      dailyRevenue,
      productPerformance,
      conversionFunnel,
      topCustomers,
      orders: currentOrders
    };
  } catch (error) {
    console.error('Analytics data error:', error);
    return {
      overview: {
        totalRevenue: 0, revenueToday: 0, totalOrders: 0, avgOrderValue: 0,
        totalProfit: 0, totalCost: 0, avgProfitMargin: 0, conversionRate: 0,
        totalCustomers: 0, newCustomers: 0, returningCustomers: 0,
        totalAbandoned: 0, recoveredCarts: 0, recoveredRevenue: 0,
        whatsappClicks: 0, contactFormSubmits: 0,
        revenueChange: null, ordersChange: null, profitChange: null
      },
      dailyRevenue: [],
      productPerformance: [],
      conversionFunnel: [],
      topCustomers: [],
      orders: []
    };
  }
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
  return <AnalyticsDashboard data={data} days={days} />;
}