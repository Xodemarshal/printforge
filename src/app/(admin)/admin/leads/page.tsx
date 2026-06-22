import { requireAdmin } from '@/lib/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import LeadsDashboard from './LeadsDashboard';

export const metadata = {
  title: 'Leads Management - PrintForge Admin',
  description: 'Manage customer leads and inquiries'
};

async function getLeadsData() {
  const supabase = createAdminClient();

  // Get all leads
  const { data: leads } = await supabase
    .from('leads')
    .select('*, products(name)')
    .order('created_at', { ascending: false });

  // Get lead stats by source
  const leadsBySource: Record<string, number> = {};
  leads?.forEach(lead => {
    leadsBySource[lead.source] = (leadsBySource[lead.source] || 0) + 1;
  });

  // Calculate conversion rate
  const totalLeads = leads?.length || 0;
  const convertedLeads = leads?.filter(l => l.converted).length || 0;
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  // Get recent customers from leads
  const { data: recentCustomers } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    leads: leads || [],
    stats: {
      total: totalLeads,
      converted: convertedLeads,
      conversionRate,
      bySource: leadsBySource
    },
    recentCustomers: recentCustomers || []
  };
}

export default async function LeadsPage() {
  await requireAdmin();

  const data = await getLeadsData();

  return <LeadsDashboard data={data} />;
}
