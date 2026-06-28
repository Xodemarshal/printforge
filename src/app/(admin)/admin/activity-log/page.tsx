import { requireAdmin } from '@/lib/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import ActivityLogDashboard from './ActivityLogDashboard';

export const metadata = {
  title: 'Activity Log - PrintForge Admin',
  description: 'Admin audit trail and activity monitoring'
};

async function getActivityData() {
  const supabase = createAdminClient();

  const { data: logs } = await supabase
    .from('admin_activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  const allLogs = logs || [];
  const todayStr = new Date().toISOString().split('T')[0];

  const actionCounts: Record<string, number> = {};
  allLogs.forEach((log: any) => {
    actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
  });

  const topActions = Object.entries(actionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([action, count]) => ({ action, count }));

  const entityTypes = [...new Set(allLogs.map((l: any) => l.entity_type).filter(Boolean))] as string[];
  const actions = [...new Set(allLogs.map((l: any) => l.action).filter(Boolean))] as string[];

  return {
    logs: allLogs,
    stats: {
      total: allLogs.length,
      today: allLogs.filter((l: any) => l.created_at?.startsWith(todayStr)).length,
      uniqueActions: Object.keys(actionCounts).length,
      uniqueEntityTypes: entityTypes.length
    },
    topActions,
    entityTypes,
    actions
  };
}

export default async function ActivityLogPage() {
  await requireAdmin();
  const data = await getActivityData();
  return <ActivityLogDashboard data={data} />;
}
