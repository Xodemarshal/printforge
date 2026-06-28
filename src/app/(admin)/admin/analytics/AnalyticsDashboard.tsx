'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  ShoppingCart,
  MessageCircle,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  Target,
  Package,
  BarChart3,
  Star,
  Layers
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AnalyticsData {
  overview: {
    totalRevenue: number;
    revenueToday: number;
    totalOrders: number;
    avgOrderValue: number;
    totalProfit: number;
    totalCost: number;
    avgProfitMargin: number;
    conversionRate: number;
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    totalAbandoned: number;
    recoveredCarts: number;
    recoveredRevenue: number;
    whatsappClicks: number;
    contactFormSubmits: number;
    revenueChange: number | null;
    ordersChange: number | null;
    profitChange: number | null;
  };
  dailyRevenue: { date: string; revenue: number; profit: number; orders: number }[];
  productPerformance: any[];
  conversionFunnel: { step: string; count: number; pct: number }[];
  topCustomers: any[];
  orders: any[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatINR(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
}
function formatINRFull(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function ChangeChip({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-xs text-gray-500">—</span>;
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
      up ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
    }`}>
      {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

// ─── Revenue / Profit SVG Line Chart ──────────────────────────────────────────
function LineChart({
  data,
  metric
}: {
  data: { date: string; revenue: number; profit: number; orders: number }[];
  metric: 'revenue' | 'profit';
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const values = data.map(d => d[metric]);
  const maxVal = Math.max(...values, 1);
  const W = 700, H = 120;

  const pts = data.map((d, i) => {
    const x = data.length > 1 ? (i / (data.length - 1)) * W : W / 2;
    const y = H - (d[metric] / maxVal) * H * 0.88 - H * 0.06;
    return { x, y, ...d };
  });

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const fillD = `${pathD} L ${W} ${H} L 0 ${H} Z`;

  const lineColor = metric === 'revenue' ? '#3A6B1C' : '#D4A017';
  const fillColor = metric === 'revenue' ? '#3A6B1C22' : '#D4A01722';

  const tickCount = Math.min(data.length, 7);
  const step = Math.floor(data.length / tickCount);
  const xTicks = data.filter((_, i) => i % step === 0 || i === data.length - 1);

  return (
    <div className="relative w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H + 24}`}
        className="w-full"
        onMouseLeave={() => setHovered(null)}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = H - t * H * 0.88 - H * 0.06;
          return (
            <line key={t} x1={0} y1={y} x2={W} y2={y}
              stroke="#2A2A2D" strokeWidth="1" strokeDasharray="4,4" />
          );
        })}
        {/* Fill */}
        <path d={fillD} fill={fillColor} />
        {/* Line */}
        <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" />
        {/* Dots + hover */}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill={lineColor}
              className="cursor-pointer"
              onMouseEnter={() => setHovered(i)} />
            {hovered === i && (
              <g>
                <rect x={Math.min(p.x - 46, W - 100)} y={p.y - 44} width="96" height="40"
                  rx="6" fill="#1C1C1E" stroke="#3A3A3D" strokeWidth="1" />
                <text x={Math.min(p.x - 46, W - 100) + 8} y={p.y - 28}
                  fill="#9CA3AF" fontSize="9" fontFamily="system-ui">
                  {fmtDate(p.date)}
                </text>
                <text x={Math.min(p.x - 46, W - 100) + 8} y={p.y - 12}
                  fill="white" fontSize="11" fontWeight="bold" fontFamily="system-ui">
                  {formatINR(p[metric])}
                </text>
              </g>
            )}
          </g>
        ))}
        {/* X-axis labels */}
        {xTicks.map((d, i) => {
          const idx = data.indexOf(d);
          const xPos = data.length > 1 ? (idx / (data.length - 1)) * W : W / 2;
          return (
            <text key={i} x={xPos} y={H + 18} textAnchor="middle"
              fill="#6B7280" fontSize="9" fontFamily="system-ui">
              {fmtDate(d.date)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Funnel Step ─────────────────────────────────────────────────────────────
const FUNNEL_LABELS: Record<string, string> = {
  product_view: 'Product Views',
  add_to_cart: 'Add to Cart',
  checkout_started: 'Checkout Started',
  purchased: 'Purchased'
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AnalyticsDashboard({ data, days }: { data: AnalyticsData; days: number }) {
  const router = useRouter();
  const [period, setPeriod] = useState(days.toString());
  const [chartMetric, setChartMetric] = useState<'revenue' | 'profit'>('revenue');

  const handlePeriod = (d: string) => {
    setPeriod(d);
    router.push(`/admin/analytics?days=${d}`);
  };

  const { overview: o, dailyRevenue, productPerformance, conversionFunnel, topCustomers } = data;

  const profitIsPositive = o.totalProfit >= 0;
  const recoveryRate = o.totalAbandoned > 0
    ? ((o.recoveredCarts / o.totalAbandoned) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            {period}-day overview · vs previous {period} days
          </p>
        </div>
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {['7', '30', '90'].map(d => (
            <button key={d} onClick={() => handlePeriod(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === d
                  ? 'bg-forest-green text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Row 1: Revenue, Orders, Profit/Loss, Avg Order ──── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="bg-[#1C1C1E] rounded-2xl p-5 border border-gray-800 col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-[#3A6B1C]/20 flex items-center justify-center">
              <IndianRupee size={16} className="text-[#3A6B1C]" />
            </div>
            <ChangeChip pct={o.revenueChange} />
          </div>
          <p className="text-2xl font-black text-white">{formatINRFull(o.totalRevenue)}</p>
          <p className="text-gray-400 text-xs mt-1">Total Revenue</p>
          <p className="text-gray-500 text-xs mt-0.5">{formatINRFull(o.revenueToday)} today</p>
        </div>

        {/* Orders */}
        <div className="bg-[#1C1C1E] rounded-2xl p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-950/20 flex items-center justify-center">
              <ShoppingBag size={16} className="text-blue-400" />
            </div>
            <ChangeChip pct={o.ordersChange} />
          </div>
          <p className="text-2xl font-black text-white">{o.totalOrders}</p>
          <p className="text-gray-400 text-xs mt-1">Total Orders</p>
          <p className="text-gray-500 text-xs mt-0.5">Avg {formatINRFull(o.avgOrderValue)}</p>
        </div>

        {/* Profit / Loss */}
        <div className={`rounded-2xl p-5 border ${
          profitIsPositive ? 'bg-[#0D2010] border-[#3A6B1C]/40' : 'bg-[#200D0D] border-red-900/40'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              profitIsPositive ? 'bg-green-900/30' : 'bg-red-900/30'
            }`}>
              {profitIsPositive
                ? <TrendingUp size={16} className="text-green-400" />
                : <TrendingDown size={16} className="text-red-400" />}
            </div>
            <ChangeChip pct={o.profitChange} />
          </div>
          <p className={`text-2xl font-black ${profitIsPositive ? 'text-green-400' : 'text-red-400'}`}>
            {formatINRFull(o.totalProfit)}
          </p>
          <p className="text-gray-400 text-xs mt-1">{profitIsPositive ? 'Net Profit' : 'Net Loss'}</p>
          <p className="text-gray-555 text-xs mt-0.5">
            Margin: {o.avgProfitMargin.toFixed(1)}%
          </p>
        </div>

        {/* Conversion */}
        <div className="bg-[#1C1C1E] rounded-2xl p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-900/20 flex items-center justify-center">
              <Target size={16} className="text-[#D4A017]" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{o.conversionRate.toFixed(2)}%</p>
          <p className="text-gray-400 text-xs mt-1">Conversion Rate</p>
          <p className="text-gray-500 text-xs mt-0.5">Views → Purchases</p>
        </div>
      </div>

      {/* ── KPI Row 2: Customers, Carts, Engagement ──────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <Users size={16} className="text-[#3A6B1C] mb-3" />
          <p className="text-xl font-bold text-white">{o.totalCustomers}</p>
          <p className="text-gray-400 text-xs mt-1">Total Customers</p>
          <p className="text-gray-500 text-xs mt-0.5">
            {o.newCustomers} new · {o.returningCustomers} returning
          </p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <ShoppingCart size={16} className="text-amber-500 mb-3" />
          <p className="text-xl font-bold text-white">{o.totalAbandoned}</p>
          <p className="text-gray-400 text-xs mt-1">Abandoned Carts</p>
          <p className="text-gray-500 text-xs mt-0.5">
            {o.recoveredCarts} recovered ({recoveryRate}%)
          </p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <IndianRupee size={16} className="text-green-400 mb-3" />
          <p className="text-xl font-bold text-white">{formatINRFull(o.recoveredRevenue)}</p>
          <p className="text-gray-400 text-xs mt-1">Recovered Revenue</p>
          <p className="text-gray-500 text-xs mt-0.5">From abandoned carts</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <MessageCircle size={16} className="text-blue-400 mb-3" />
          <p className="text-xl font-bold text-white">
            {o.whatsappClicks + o.contactFormSubmits}
          </p>
          <p className="text-gray-400 text-xs mt-1">Engagement</p>
          <p className="text-gray-500 text-xs mt-0.5">
            {o.whatsappClicks} WhatsApp · {o.contactFormSubmits} forms
          </p>
        </div>
      </div>

      {/* ── Revenue / Profit Chart ────────────────────────────── */}
      <div className="bg-[#1C1C1E] rounded-2xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold text-lg">Revenue &amp; Profit Trend</h2>
            <p className="text-gray-500 text-xs">Daily breakdown for the last {period} days</p>
          </div>
          <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
            {(['revenue', 'profit'] as const).map(m => (
              <button key={m} onClick={() => setChartMetric(m)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                  chartMetric === m
                    ? m === 'revenue' ? 'bg-[#3A6B1C] text-white' : 'bg-[#D4A017] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Y-axis value labels */}
        <div className="flex gap-4 mb-2 text-xs text-gray-500">
          {[0, 0.25, 0.5, 0.75, 1].reverse().map(t => {
            const maxV = Math.max(...dailyRevenue.map(d => d[chartMetric]), 1);
            return (
              <span key={t} className="w-14 text-right">
                {formatINR(maxV * t)}
              </span>
            );
          })}
        </div>

        {dailyRevenue.length > 0 ? (
          <LineChart data={dailyRevenue} metric={chartMetric} />
        ) : (
          <div className="py-12 text-center">
            <BarChart3 size={40} className="text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No order data in this period</p>
          </div>
        )}

        {/* Summary footer */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-800">
          <div>
            <p className="text-xs text-gray-500">Total Revenue</p>
            <p className="text-white font-bold">{formatINRFull(o.totalRevenue)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Cost</p>
            <p className="text-white font-bold">{formatINRFull(o.totalCost)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Net Profit</p>
            <p className={`font-bold ${profitIsPositive ? 'text-green-400' : 'text-red-400'}`}>
              {formatINRFull(o.totalProfit)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Avg Margin</p>
            <p className={`font-bold ${o.avgProfitMargin >= 20 ? 'text-green-400' : 'text-amber-400'}`}>
              {o.avgProfitMargin.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Funnel + Product Performance ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Conversion Funnel */}
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-sm">
          <h2 className="text-white font-semibold text-base mb-5 flex items-center gap-2">
            <Target size={16} className="text-[#3A6B1C]" /> Conversion Funnel
          </h2>
          <div className="space-y-4">
            {conversionFunnel.map((step, i) => {
              const label = FUNNEL_LABELS[step.step] || step.step;
              const colors = [
                'bg-forest-green', 'bg-[#D4A017]', 'bg-blue-500', 'bg-purple-500'
              ];
              return (
                <div key={step.step}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-300 font-medium">{label}</span>
                    <span className="text-gray-400">
                      {step.count.toLocaleString('en-IN')}
                      <span className="ml-1 text-xs text-gray-500">
                        ({step.pct.toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-3 bg-black rounded-full overflow-hidden">
                    <div
                      className={`h-3 ${colors[i]} rounded-full transition-all`}
                      style={{ width: `${Math.min(step.pct, 100)}%` }}
                    />
                  </div>
                  {i < conversionFunnel.length - 1 && (
                    <div className="ml-4 mt-1 text-xs text-gray-600 flex items-center gap-1">
                      <span>↓</span>
                      {conversionFunnel[i + 1].count > 0 && step.count > 0 && (
                        <span>{((conversionFunnel[i + 1].count / step.count) * 100).toFixed(1)}% continued</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Product Performance */}
        <div className="lg:col-span-3 bg-gray-900 rounded-2xl border border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-850 flex items-center gap-2">
            <Package size={16} className="text-[#3A6B1C]" />
            <h2 className="text-white font-semibold text-base">Top Products</h2>
          </div>
          {productPerformance.length === 0 ? (
            <div className="py-12 text-center">
              <Layers size={36} className="text-gray-700 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No product data for this period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">#</th>
                    <th className="px-5 py-3 text-left">Product</th>
                    <th className="px-5 py-3 text-right">Orders</th>
                    <th className="px-5 py-3 text-right">Revenue</th>
                    <th className="px-5 py-3 text-right">Conv%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-850">
                  {productPerformance.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-3 text-gray-500 text-xs">{i + 1}</td>
                      <td className="px-5 py-3 font-medium text-gray-250 max-w-[180px] truncate">
                        {p.product_name}
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-right">{p.orders}</td>
                      <td className="px-5 py-3 text-right font-semibold text-white">
                        {formatINRFull(Number(p.revenue))}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-xs font-medium text-[#3A6B1C] bg-green-950/40 border border-green-900/60 px-2 py-0.5 rounded-full">
                          {p.conversion_rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Daily Revenue Mini Bars + Top Customers ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Daily Bars */}
        <div className="lg:col-span-2 bg-[#1C1C1E] rounded-2xl border border-gray-800 p-6">
          <h2 className="text-white font-semibold mb-1">Daily Orders</h2>
          <p className="text-gray-500 text-xs mb-4">Order count per day</p>
          {dailyRevenue.length > 0 ? (
            <div className="flex items-end gap-0.5 h-24">
              {dailyRevenue.map((d, i) => {
                const maxOrders = Math.max(...dailyRevenue.map(x => x.orders), 1);
                const heightPct = (d.orders / maxOrders) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full bg-[#3A6B1C] hover:bg-[#D4A017] rounded-t transition-all cursor-pointer"
                      style={{ height: `${heightPct}%`, minHeight: d.orders > 0 ? 3 : 1 }}
                    />
                    {/* tooltip */}
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 border border-gray-700">
                      {fmtDate(d.date)}: {d.orders} orders
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-gray-600 text-sm">No data</div>
          )}
        </div>

        {/* Top Customers */}
        <div className="lg:col-span-3 bg-gray-900 rounded-2xl border border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-850 flex items-center gap-2">
            <Star size={16} className="text-[#D4A017] fill-[#D4A017]" />
            <h2 className="text-white font-semibold text-base">Top Customers</h2>
          </div>
          {topCustomers.length === 0 ? (
            <div className="py-12 text-center">
              <Users size={36} className="text-gray-700 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No customer data yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-550 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left font-medium">Customer</th>
                    <th className="px-5 py-3 text-right font-medium">Orders</th>
                    <th className="px-5 py-3 text-right font-medium">Total Spent</th>
                    <th className="px-5 py-3 text-right font-medium">Last Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-850">
                  {topCustomers.slice(0, 8).map((c, i) => (
                    <tr key={i} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#3A6B1C]/20 flex items-center justify-center text-green-400 text-xs font-bold shrink-0">
                            {(c.name || c.email || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-gray-200 font-medium text-xs">{c.name || 'Customer'}</p>
                            <p className="text-gray-500 text-xs truncate max-w-[120px]">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-right">{c.total_orders}</td>
                      <td className="px-5 py-3 text-right font-semibold text-white">
                        {formatINRFull(Number(c.total_spent))}
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs text-right">
                        {c.last_order_date
                          ? new Date(c.last_order_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
