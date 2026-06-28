'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  Package,
  Zap,
  AlertTriangle,
  IndianRupee
} from 'lucide-react';

interface Props {
  data: {
    overview: {
      total_revenue: number;
      total_cost: number;
      total_profit: number;
      avg_profit_margin: number;
    };
    orders: any[];
    productProfitability: Array<{
      product: string;
      revenue: number;
      cost: number;
      profit: number;
      margin: number;
      orders: number;
    }>;
    revenuePerPrinterHour: number;
  };
  days: number;
}

function formatINR(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(n);
}

function MarginBar({ pct }: { pct: number }) {
  const color = pct >= 40 ? '#3A6B1C' : pct >= 20 ? '#D4A017' : '#EF4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-black rounded-full overflow-hidden">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${Math.min(Math.max(pct, 0), 100)}%`, background: color }}
        />
      </div>
      <span className="text-xs font-medium w-12 text-right" style={{ color }}>
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

export default function ProfitabilityDashboard({ data, days }: Props) {
  const router = useRouter();
  const [period, setPeriod] = useState(days.toString());
  const [tab, setTab] = useState<'profitable' | 'margin' | 'worst'>('profitable');

  const handlePeriod = (d: string) => {
    setPeriod(d);
    router.push(`/admin/profitability?days=${d}`);
  };

  const overview = data.overview;
  const profitIsPositive = Number(overview.total_profit) >= 0;

  const mostProfitable = [...data.productProfitability].sort((a, b) => b.profit - a.profit).slice(0, 10);
  const highestMargin = [...data.productProfitability].sort((a, b) => b.margin - a.margin).slice(0, 10);
  const leastProfitable = [...data.productProfitability].sort((a, b) => a.profit - b.profit).slice(0, 10);

  const hasData = data.productProfitability.length > 0;

  const tabList = [
    { id: 'profitable' as const, label: 'Most Profitable' },
    { id: 'margin' as const, label: 'Best Margin' },
    { id: 'worst' as const, label: '⚠ Needs Attention' }
  ];

  const activeList = tab === 'profitable' ? mostProfitable : tab === 'margin' ? highestMargin : leastProfitable;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Profitability Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Revenue, cost, and profit breakdown</p>
        </div>
        <div className="flex gap-1 bg-[#1C1C1E] border border-gray-800 rounded-xl p-1">
          {['7', '30', '90'].map(d => (
            <button key={d} onClick={() => handlePeriod(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === d ? 'bg-[#3A6B1C] text-white' : 'text-gray-400 hover:text-white'
              }`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#1C1C1E] rounded-2xl p-5 border border-gray-800">
          <IndianRupee size={16} className="text-[#3A6B1C] mb-3" />
          <p className="text-xl font-black text-white">{formatINR(Number(overview.total_revenue))}</p>
          <p className="text-gray-500 text-xs mt-1">Total Revenue</p>
        </div>

        <div className="bg-[#1C1C1E] rounded-2xl p-5 border border-gray-800">
          <TrendingDown size={16} className="text-red-400 mb-3" />
          <p className="text-xl font-black text-white">{formatINR(Number(overview.total_cost))}</p>
          <p className="text-gray-500 text-xs mt-1">Total Cost</p>
        </div>

        <div className={`rounded-2xl p-5 border ${
          profitIsPositive ? 'bg-[#0D2010] border-[#3A6B1C]/40' : 'bg-[#200D0D] border-red-900/40'
        }`}>
          {profitIsPositive
            ? <TrendingUp size={16} className="text-green-400 mb-3" />
            : <TrendingDown size={16} className="text-red-400 mb-3" />
          }
          <p className={`text-xl font-black ${profitIsPositive ? 'text-green-400' : 'text-red-400'}`}>
            {formatINR(Number(overview.total_profit))}
          </p>
          <p className="text-gray-500 text-xs mt-1">{profitIsPositive ? 'Net Profit ✓' : 'Net Loss ✗'}</p>
        </div>

        <div className="bg-[#1C1C1E] rounded-2xl p-5 border border-gray-800">
          <Package size={16} className="text-purple-400 mb-3" />
          <p className={`text-xl font-black ${
            Number(overview.avg_profit_margin) >= 20 ? 'text-green-400' : 'text-amber-400'
          }`}>
            {Number(overview.avg_profit_margin).toFixed(1)}%
          </p>
          <p className="text-gray-500 text-xs mt-1">Avg Profit Margin</p>
        </div>

        <div className="bg-[#1C1C1E] rounded-2xl p-5 border border-gray-800">
          <Zap size={16} className="text-[#D4A017] mb-3" />
          <p className="text-xl font-black text-white">
            {data.revenuePerPrinterHour > 0 ? formatINR(data.revenuePerPrinterHour) : '—'}
          </p>
          <p className="text-gray-500 text-xs mt-1">Revenue / Printer Hour</p>
        </div>
      </div>

      {/* No cost data notice */}
      {hasData && data.productProfitability.every(p => p.cost === 0) && (
        <div className="bg-amber-900/20 border border-amber-800/40 rounded-xl px-5 py-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-semibold text-sm">Product costs not set</p>
            <p className="text-amber-600 text-xs mt-0.5">
              Profit calculations require product cost data. Go to the Products page and set "Estimated Total Cost" for each product, or use the Profitability action to calculate per-order.
            </p>
          </div>
        </div>
      )}

      {/* Product Profitability Table */}
      <div className="bg-[#1C1C1E] rounded-2xl border border-gray-800 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-800 px-6 pt-4 gap-1">
          {tabList.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
                tab === t.id
                  ? 'border-[#3A6B1C] text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {!hasData ? (
          <div className="py-20 text-center">
            <Package size={48} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No product data for this period</p>
            <p className="text-gray-650 text-sm mt-1">Orders with paid status will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">Product</th>
                  <th className="px-5 py-3 text-right">Revenue</th>
                  <th className="px-5 py-3 text-right">Cost</th>
                  <th className="px-5 py-3 text-right">Profit</th>
                  <th className="px-5 py-3 text-right w-40">Margin</th>
                  <th className="px-5 py-3 text-right">Orders</th>
                </tr>
              </thead>
              <tbody>
                {activeList.map((item, i) => (
                  <tr key={i} className="border-t border-gray-800 hover:bg-gray-900/40 transition-colors">
                    <td className="px-5 py-3 text-gray-600 text-xs">{i + 1}</td>
                    <td className="px-5 py-3 text-gray-200 font-medium max-w-[200px] truncate">{item.product}</td>
                    <td className="px-5 py-3 text-gray-300 text-right">{formatINR(item.revenue)}</td>
                    <td className="px-5 py-3 text-gray-500 text-right">{formatINR(item.cost)}</td>
                    <td className={`px-5 py-3 font-semibold text-right ${
                      item.profit >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>{formatINR(item.profit)}</td>
                    <td className="px-5 py-3 text-right w-40">
                      <MarginBar pct={item.margin} />
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-right">{item.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Orders with Profit */}
      {data.orders.length > 0 && (
        <div className="bg-[#1C1C1E] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-white font-semibold">Recent Orders — Profit Detail</h2>
            <p className="text-gray-500 text-xs mt-0.5">
              Orders where profit_amount has been calculated. Run "Calculate Profitability" on the Orders page to populate missing data.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                  <th className="px-5 py-3 text-left">Order</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-right">Revenue</th>
                  <th className="px-5 py-3 text-right">Cost</th>
                  <th className="px-5 py-3 text-right">Profit</th>
                  <th className="px-5 py-3 text-right w-36">Margin</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.slice(0, 20).map((order: any) => {
                  const revenue = Number(order.total_amount || 0);
                  const cost = Number(order.total_cost || 0);
                  const profit = Number(order.profit_amount || 0);
                  const margin = Number(order.profit_margin || 0);
                  const hasProfit = order.profit_amount !== null && order.profit_amount !== undefined;
                  return (
                    <tr key={order.id} className="border-t border-gray-800 hover:bg-gray-900/30 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-amber-400">{order.id?.slice(0, 8)}…</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-5 py-3 text-gray-200 text-right">{formatINR(revenue)}</td>
                      <td className="px-5 py-3 text-gray-500 text-right">{hasProfit ? formatINR(cost) : '—'}</td>
                      <td className={`px-5 py-3 font-semibold text-right ${
                        !hasProfit ? 'text-gray-600' : profit >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {hasProfit ? formatINR(profit) : 'Not calculated'}
                      </td>
                      <td className="px-5 py-3 text-right w-36">
                        {hasProfit ? <MarginBar pct={margin} /> : (
                          <span className="text-gray-700 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
