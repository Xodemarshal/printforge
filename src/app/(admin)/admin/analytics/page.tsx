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

  try {
    // Revenue stats
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_status', 'paid')
      .gte('created_at', startDate);

    if (ordersError) {
      console.error('Orders error:', ordersError);
    }

    const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
    const totalOrders = orders?.length || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Today's revenue
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaysOrders = orders?.filter(o => new Date(o.created_at) >= todayStart) || [];
    const revenueToday = todaysOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

    // Customer stats
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*');

    if (customersError) {
      console.error('Customers error:', customersError);
    }

    const totalCustomers = customers?.length || 0;
    const newCustomers = customers?.filter(c => 
      new Date(c.created_at) >= new Date(startDate)
    ).length || 0;
    const returningCustomers = customers?.filter(c => c.total_orders > 1).length || 0;

    // Product performance - with error handling
    let productPerformance = [];
    try {
      const { data, error } = await supabase
        .rpc('get_product_performance', { days });
      
      if (error) {
        console.error('Product performance RPC error:', error);
      } else {
        productPerformance = data || [];
      }
    } catch (e) {
      console.error('Product performance exception:', e);
    }

    // Conversion funnel - with error handling
    let conversionFunnel = [];
    try {
      const { data, error } = await supabase
        .rpc('get_conversion_funnel', { days });
      
      if (error) {
        console.error('Conversion funnel RPC error:', error);
      } else {
        conversionFunnel = data || [];
      }
    } catch (e) {
      console.error('Conversion funnel exception:', e);
    }

    // Abandoned carts
    const { data: abandonedCarts, error: cartsError } = await supabase
      .from('cart_sessions')
      .select('*')
      .eq('abandoned', true)
      .gte('created_at', startDate);

    if (cartsError) {
      console.error('Cart sessions error:', cartsError);
    }

    const totalAbandoned = abandonedCarts?.length || 0;
    const recoveredCarts = abandonedCarts?.filter(c => c.recovered).length || 0;
    const recoveredRevenue = abandonedCarts
      ?.filter(c => c.recovered)
      .reduce((sum, c) => sum + Number(c.cart_value), 0) || 0;

    // Analytics events
    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', startDate);

    if (eventsError) {
      console.error('Analytics events error:', eventsError);
    }

    const whatsappClicks = events?.filter(e => e.event_name === 'whatsapp_click').length || 0;
    const contactFormSubmits = events?.filter(e => e.event_name === 'contact_form_submit').length || 0;

    // Top customers
    const { data: topCustomers, error: topCustomersError } = await supabase
      .from('customers')
      .select('*')
      .order('total_spent', { ascending: false })
      .limit(10);

    if (topCustomersError) {
      console.error('Top customers error:', topCustomersError);
    }

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
  } catch (error) {
    console.error('Analytics data error:', error);
    
    // Return empty data structure on error
    return {
      overview: {
        totalRevenue: 0,
        revenueToday: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        conversionRate: 0,
        totalCustomers: 0,
        newCustomers: 0,
        returningCustomers: 0,
        totalAbandoned: 0,
        recoveredCarts: 0,
        recoveredRevenue: 0,
        whatsappClicks: 0,
        contactFormSubmits: 0
      },
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

  return (
    <AnalyticsDashboard
      data={data}
      days={days}
    />
  );
}