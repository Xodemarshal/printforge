import { requireAdmin } from '@/lib/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import ProfitabilityDashboard from './ProfitabilityDashboard';

export const metadata = {
  title: 'Profitability Dashboard - PrintForge Admin',
  description: 'Product and order profitability tracking'
};

async function getProfitabilityData(days: number = 30) {
  const supabase = createAdminClient();
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Get orders with profit data — select all relevant profit columns
  const { data: orders } = await supabase
    .from('orders')
    .select('id, total_amount, total_cost, profit_amount, profit_margin, created_at, order_items(unit_price, quantity, products(name))')
    .eq('payment_status', 'paid')
    .gte('created_at', startDate)
    .order('created_at', { ascending: false });

  const allOrders = orders || [];

  // Compute overview directly from orders (no RPC needed)
  const total_revenue = allOrders.reduce((s, o) => s + Number(o.total_amount), 0);
  const total_cost = allOrders.reduce((s, o) => s + Number(o.total_cost || 0), 0);
  const total_profit = allOrders.reduce((s, o) => s + Number(o.profit_amount || 0), 0);
  const marginsWithData = allOrders.filter(o => o.profit_margin !== null && o.profit_margin !== undefined);
  const avg_profit_margin = marginsWithData.length > 0
    ? marginsWithData.reduce((s, o) => s + Number(o.profit_margin), 0) / marginsWithData.length
    : total_revenue > 0 ? (total_profit / total_revenue) * 100 : 0;

  // Calculate product profitability from order_items
  const productProfitMap: Record<string, { revenue: number; cost: number; profit: number; orders: number }> = {};
  allOrders.forEach(order => {
    const items = (order.order_items as any[]) || [];
    const orderRev = Number(order.total_amount) || 0;
    const orderCost = Number(order.total_cost) || 0;
    const costRatio = orderRev > 0 ? orderCost / orderRev : 0;

    items.forEach(item => {
      const productName = (item.products as any)?.name || 'Unknown';
      if (!productProfitMap[productName]) {
        productProfitMap[productName] = { revenue: 0, cost: 0, profit: 0, orders: 0 };
      }
      const itemRevenue = Number(item.unit_price) * Number(item.quantity);
      const itemCost = itemRevenue * costRatio;
      productProfitMap[productName].revenue += itemRevenue;
      productProfitMap[productName].cost += itemCost;
      productProfitMap[productName].profit += itemRevenue - itemCost;
      productProfitMap[productName].orders += 1;
    });
  });

  const productProfitability = Object.entries(productProfitMap).map(([name, d]) => ({
    product: name,
    revenue: d.revenue,
    cost: d.cost,
    profit: d.profit,
    margin: d.revenue > 0 ? (d.profit / d.revenue) * 100 : 0,
    orders: d.orders
  }));

  // Print jobs for printer efficiency
  const { data: printJobs } = await supabase
    .from('print_jobs')
    .select('actual_print_hours')
    .gte('created_at', startDate);

  const totalPrintHours = (printJobs || [])
    .filter(j => j.actual_print_hours !== null && j.actual_print_hours !== undefined)
    .reduce((s, j) => s + Number(j.actual_print_hours), 0) || 1;
  const revenuePerPrinterHour = total_revenue / totalPrintHours;

  return {
    overview: { total_revenue, total_cost, total_profit, avg_profit_margin },
    orders: allOrders,
    productProfitability,
    revenuePerPrinterHour
  };
}

type PageProps = {
  searchParams?: Promise<{ days?: string }>;
};

export default async function ProfitabilityPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;
  const days = parseInt(params?.days ?? '30', 10);
  const data = await getProfitabilityData(days);
  return <ProfitabilityDashboard data={data} days={days} />;
}