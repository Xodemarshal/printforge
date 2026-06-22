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

  // Get profitability stats
  const { data: profitStats } = await supabase
    .rpc('get_profitability_stats', { days });

  // Get orders with profit data
  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name))')
    .eq('payment_status', 'paid')
    .gte('created_at', startDate)
    .order('profit_amount', { ascending: false });

  // Calculate product profitability
  const productProfitMap: Record<string, { revenue: number; cost: number; profit: number; orders: number }> = {};
  
  orders?.forEach(order => {
    const items = order.order_items as any[];
    items.forEach(item => {
      const productName = item.products?.name || 'Unknown';
      if (!productProfitMap[productName]) {
        productProfitMap[productName] = { revenue: 0, cost: 0, profit: 0, orders: 0 };
      }
      const itemRevenue = item.unit_price * item.quantity;
      const itemCost = (Number(order.total_cost) / Number(order.total_amount)) * itemRevenue;
      productProfitMap[productName].revenue += itemRevenue;
      productProfitMap[productName].cost += itemCost;
      productProfitMap[productName].profit += itemRevenue - itemCost;
      productProfitMap[productName].orders += 1;
    });
  });

  const productProfitability = Object.entries(productProfitMap).map(([name, data]) => ({
    product: name,
    revenue: data.revenue,
    cost: data.cost,
    profit: data.profit,
    margin: data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0,
    orders: data.orders
  }));

  // Get print jobs for printer performance
  const { data: printJobs } = await supabase
    .from('print_jobs')
    .select('*')
    .gte('created_at', startDate);

  const totalPrintHours = printJobs?.reduce((sum, j) => sum + Number(j.actual_print_hours || 0), 0) || 1;
  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
  const revenuePerPrinterHour = totalRevenue / totalPrintHours;

  return {
    overview: profitStats?.[0] || {
      total_revenue: 0,
      total_cost: 0,
      total_profit: 0,
      avg_profit_margin: 0
    },
    orders: orders || [],
    productProfitability,
    revenuePerPrinterHour
  };
}
type PageProps = {
  searchParams?: Promise<{
    days?: string;
  }>;
};

export default async function ProfitabilityPage({
  searchParams,
}: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const days = parseInt(params?.days ?? '30', 10);

  const data = await getProfitabilityData(days);

  return (
    <ProfitabilityDashboard
      data={data}
      days={days}
    />
  );
}