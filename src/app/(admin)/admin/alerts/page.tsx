import { requireAdmin } from '@/lib/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import AlertCenterDashboard from './AlertCenterDashboard';

export const metadata = {
  title: 'Alert Center - PrintForge Admin',
  description: 'Monitor and manage admin alerts'
};

async function getAlertsData() {
  const supabase = createAdminClient();

  const { data: alerts } = await supabase
    .from('admin_alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  const allAlerts = alerts || [];
  const unread = allAlerts.filter((a: any) => a.status === 'unread').length;
  const critical = allAlerts.filter((a: any) => a.severity === 'critical').length;
  const warning = allAlerts.filter((a: any) => a.severity === 'warning').length;
  const resolved = allAlerts.filter((a: any) => a.status === 'resolved').length;

  return {
    stats: { total: allAlerts.length, unread, critical, warning, resolved },
    alerts: allAlerts
  };
}

export default async function AlertsPage() {
  await requireAdmin();
  const data = await getAlertsData();
  return <AlertCenterDashboard data={data} />;
}
