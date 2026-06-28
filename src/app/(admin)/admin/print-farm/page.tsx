import { requireAdmin } from '@/lib/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import PrintFarmDashboard from './PrintFarmDashboard';

export const metadata = {
  title: 'Print Farm - PrintForge Admin',
  description: 'Monitor and manage 3D print jobs'
};

async function getPrintFarmData() {
  const supabase = createAdminClient();

  const { data: allJobs } = await supabase
    .from('print_jobs')
    .select('*, orders(id, customer_name, total_amount)')
    .order('created_at', { ascending: false })
    .limit(100);

  const jobs = allJobs || [];
  const activeJobs = jobs.filter((j: any) => !j.completed_at && !j.failed);
  const completedJobs = jobs.filter((j: any) => j.completed_at && !j.failed);
  const failedJobs = jobs.filter((j: any) => j.failed);
  const successRate =
    jobs.length > 0 ? (completedJobs.length / jobs.length) * 100 : 0;
  const avgPrintHours =
    completedJobs.length > 0
      ? completedJobs.reduce(
          (s: number, j: any) => s + Number(j.actual_print_hours || 0),
          0
        ) / completedJobs.length
      : 0;
  const totalFilament = jobs.reduce(
    (s: number, j: any) => s + Number(j.filament_used_grams || 0),
    0
  );

  const { data: pendingOrders } = await supabase
    .from('orders')
    .select('id, customer_name, total_amount, created_at')
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: false })
    .limit(50);

  return {
    stats: {
      totalJobs: jobs.length,
      activeJobs: activeJobs.length,
      completedJobs: completedJobs.length,
      failedJobs: failedJobs.length,
      successRate,
      avgPrintHours,
      totalFilament
    },
    activeJobsList: activeJobs,
    recentJobs: jobs.slice(0, 50),
    pendingOrders: pendingOrders || []
  };
}

export default async function PrintFarmPage() {
  await requireAdmin();
  const data = await getPrintFarmData();
  return <PrintFarmDashboard data={data} />;
}
