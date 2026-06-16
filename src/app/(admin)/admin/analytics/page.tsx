import { createAdminClient } from "@/lib/supabase/admin";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { Badge } from "@/components/ui/Badge";

export default async function AnalyticsPage() {
  const supabase = createAdminClient();
  const { data: orders } = await supabase.from("orders").select("*").limit(100);
  const chartData = (orders ?? []).map((order: any) => ({
    date: String(order.created_at).slice(0, 10),
    revenue: Number(order.total_amount ?? 0)
  }));

  return (
    <div className="space-y-8">
      <div className="panel-dark rounded-[34px] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#c8b99d]">Analytics</p>
            <h1 className="display-font mt-3 text-5xl leading-[0.95] text-[#f4ecd9]">Performance dashboard</h1>
          </div>
          <Badge className="bg-[#243a2b] text-[#e9dfcc]" tone="secondary">
            Monthly view
          </Badge>
        </div>
      </div>
      <AnalyticsCharts data={chartData} />
    </div>
  );
}
