"use client";

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function AnalyticsCharts({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <div className="grid gap-8">
      <div className="h-80 rounded-[28px] border border-white/8 bg-[#101a14] p-4 text-[#f4ecd9] shadow-[0_24px_70px_rgba(0,0,0,0.3)]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="date" stroke="#ccbfa8" />
            <YAxis stroke="#ccbfa8" />
            <Tooltip
              contentStyle={{ background: "#111d16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }}
            />
            <Bar dataKey="revenue" fill="#89c072" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="h-80 rounded-[28px] border border-white/8 bg-[#101a14] p-4 text-[#f4ecd9] shadow-[0_24px_70px_rgba(0,0,0,0.3)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" stroke="#ccbfa8" />
            <YAxis stroke="#ccbfa8" />
            <Tooltip
              contentStyle={{ background: "#111d16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }}
            />
            <Line type="monotone" dataKey="revenue" stroke="#c9a86a" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
