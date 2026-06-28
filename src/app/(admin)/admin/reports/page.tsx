import { requireAdmin } from '@/lib/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import ReportsDashboard from './ReportsDashboard';

export const metadata = {
  title: 'Reports - PrintForge Admin',
  description: 'Manage automated business reports and subscriptions'
};

async function getReportsData() {
  const supabase = createAdminClient();

  const { data: subscriptions } = await supabase
    .from('scheduled_reports')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: recentReports } = await supabase
    .from('report_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  return {
    subscriptions: subscriptions || [],
    recentReports: recentReports || []
  };
}

export default async function ReportsPage() {
  await requireAdmin();
  const data = await getReportsData();
  return <ReportsDashboard data={data} />;
}
