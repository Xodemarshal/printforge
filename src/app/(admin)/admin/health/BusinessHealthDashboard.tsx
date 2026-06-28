'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  DollarSign,
  ShoppingBag,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { calculateBusinessHealthAction } from '@/actions/businessHealth';

type HealthData = {
  latest: any;
  trend: { health_score: number; health_category: string; created_at: string }[];
  liveMetrics: {
    currentRevenue: number;
    revenueGrowth: number;
    avgMargin: number;
    retentionRate: number;
    avgRating: number;
    totalOrders: number;
    totalCustomers: number;
    totalReviews: number;
  };
};

function getCategory(score: number) {
  if (score >= 80) return { label: 'Excellent', color: '#10B981', bg: 'bg-emerald-900/30', text: 'text-emerald-400', ring: '#10B981' };
  if (score >= 60) return { label: 'Good', color: '#3B82F6', bg: 'bg-blue-900/30', text: 'text-blue-400', ring: '#3B82F6' };
  if (score >= 40) return { label: 'Warning', color: '#F59E0B', bg: 'bg-amber-900/30', text: 'text-amber-400', ring: '#F59E0B' };
  return { label: 'Critical', color: '#EF4444', bg: 'bg-red-900/30', text: 'text-red-400', ring: '#EF4444' };
}

function ScoreRing({ score }: { score: number }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const cat = getCategory(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="220" height="220" viewBox="0 0 220 220">
        <circle cx="110" cy="110" r={radius} fill="none" stroke="#2A2A2D" strokeWidth="18" />
        <circle
          cx="110" cy="110" r={radius}
          fill="none"
          stroke={cat.ring}
          strokeWidth="18"
          strokeDasharray={`${filled} ${circumference}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-6xl font-black text-white">{score}</span>
        <span className="text-gray-400 text-sm">/100</span>
        <span className={`mt-1 px-3 py-0.5 rounded-full text-sm font-semibold ${cat.text} ${cat.bg}`}>
          {cat.label}
        </span>
      </div>
    </div>
  );
}

function SparkLine({ trend }: { trend: { health_score: number; created_at: string }[] }) {
  if (trend.length < 2) return null;
  const w = 400, h = 80;
  const scores = trend.map((t) => t.health_score);
  const min = Math.min(...scores, 0);
  const max = Math.max(...scores, 100);
  const range = max - min || 1;
  const pts = trend.map((t, i) => {
    const x = (i / (trend.length - 1)) * w;
    const y = h - ((t.health_score - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16 overflow-visible">
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke="#3A6B1C"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {trend.map((t, i) => {
        const x = (i / (trend.length - 1)) * w;
        const y = h - ((t.health_score - min) / range) * h;
        return <circle key={i} cx={x} cy={y} r="3" fill="#D4A017" />;
      })}
    </svg>
  );
}

export default function BusinessHealthDashboard({ data }: { data: HealthData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const handleRecalculate = () => {
    startTransition(async () => {
      const res = await calculateBusinessHealthAction();
      if (res?.success) {
        setMsg(`Score calculated: ${res.healthScore} (${res.healthCategory})`);
        setTimeout(() => setMsg(null), 5000);
        router.refresh();
      }
    });
  };

  const score = data.latest?.health_score ?? null;
  const m = data.liveMetrics;

  const metrics = [
    {
      label: 'Revenue (30d)',
      value: `₹${m.currentRevenue.toLocaleString('en-IN')}`,
      sub: m.revenueGrowth >= 0 ? `+${m.revenueGrowth.toFixed(1)}% growth` : `${m.revenueGrowth.toFixed(1)}% decline`,
      icon: DollarSign,
      color: m.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400',
      trend: m.revenueGrowth >= 0 ? 'up' : 'down'
    },
    {
      label: 'Avg Profit Margin',
      value: `${m.avgMargin.toFixed(1)}%`,
      sub: m.avgMargin >= 20 ? 'Healthy margin' : 'Below target',
      icon: TrendingUp,
      color: m.avgMargin >= 20 ? 'text-green-400' : 'text-amber-400',
      trend: m.avgMargin >= 20 ? 'up' : 'down'
    },
    {
      label: 'Customer Retention',
      value: `${m.retentionRate.toFixed(1)}%`,
      sub: `${m.totalCustomers} total customers`,
      icon: Users,
      color: 'text-blue-400',
      trend: 'up'
    },
    {
      label: 'Avg Rating',
      value: m.avgRating > 0 ? `${m.avgRating.toFixed(1)} ★` : 'N/A',
      sub: `${m.totalReviews} approved reviews`,
      icon: Star,
      color: 'text-[#D4A017]',
      trend: 'up'
    },
    {
      label: 'Orders (30d)',
      value: m.totalOrders.toString(),
      sub: 'Paid orders',
      icon: ShoppingBag,
      color: 'text-purple-400',
      trend: 'up'
    },
    {
      label: 'Total Customers',
      value: m.totalCustomers.toString(),
      sub: 'All time',
      icon: MessageSquare,
      color: 'text-cyan-400',
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-yellow-500/80 mb-1">PrintForge Admin</p>
        <h1 className="text-3xl font-bold text-white">Business Health Score</h1>
        <p className="text-gray-400 text-sm mt-1">Powered by real-time metrics across all operations.</p>
      </div>

      <div className="space-y-6">
        {msg && (
          <div className="bg-green-900/20 text-green-400 border border-green-800 rounded-xl px-5 py-3 text-sm flex items-center gap-2">
            <CheckCircle2 size={16} /> {msg}
          </div>
        )}

        {/* Score + Recalculate */}
        <div className="bg-[#1C1C1E] rounded-3xl border border-gray-800 p-8 flex flex-col items-center text-center">
          {score !== null ? (
            <>
              <ScoreRing score={Math.round(score)} />
              {data.latest?.created_at && (
                <p className="text-gray-500 text-xs mt-3">
                  Last calculated: {new Date(data.latest.created_at).toLocaleString('en-IN')}
                </p>
              )}
            </>
          ) : (
            <div className="py-8">
              <Activity size={64} className="text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 font-semibold text-lg">No health score yet</p>
              <p className="text-gray-600 text-sm mt-1">Click below to calculate your first score</p>
            </div>
          )}
          <button
            onClick={handleRecalculate}
            disabled={isPending}
            className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#3A6B1C] hover:bg-[#2D5016] text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isPending ? 'animate-spin' : ''} />
            {isPending ? 'Calculating…' : 'Recalculate Health Score'}
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics.map(({ label, value, sub, icon: Icon, color, trend }) => (
            <div key={label} className="bg-[#1C1C1E] rounded-2xl p-5 border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <Icon size={20} className={color} />
                {trend === 'up'
                  ? <TrendingUp size={14} className="text-green-500" />
                  : <TrendingDown size={14} className="text-red-500" />
                }
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-gray-300 text-sm font-medium mt-1">{label}</p>
              <p className="text-gray-600 text-xs mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Trend Chart */}
        <div className="bg-[#1C1C1E] rounded-2xl border border-gray-800 p-6">
          <h2 className="text-white font-semibold mb-1">Health Score Trend</h2>
          <p className="text-gray-500 text-sm mb-4">Last {data.trend.length} snapshots</p>
          {data.trend.length >= 2 ? (
            <SparkLine trend={data.trend} />
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500 text-sm">
                Run health calculation multiple times to see your trend over time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
