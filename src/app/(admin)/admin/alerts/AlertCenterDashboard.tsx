'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Plus,
  X,
  ShieldAlert
} from 'lucide-react';
import {
  markAlertAsReadAction,
  resolveAlertAction,
  createAdminAlertAction
} from '@/actions/adminAlerts';

type AlertsData = {
  stats: { total: number; unread: number; critical: number; warning: number; resolved: number };
  alerts: any[];
};

type FilterType = 'all' | 'critical' | 'warning' | 'info' | 'unread' | 'resolved';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const severityStyles: Record<string, string> = {
  critical: 'border-red-500 bg-red-950/20',
  warning: 'border-amber-500 bg-amber-950/10',
  info: 'border-blue-500 bg-blue-950/10'
};

const severityBadge: Record<string, string> = {
  critical: 'bg-red-900/50 text-red-400',
  warning: 'bg-amber-900/50 text-amber-400',
  info: 'bg-blue-900/50 text-blue-400'
};

const statusBadge: Record<string, string> = {
  unread: 'bg-gray-700 text-gray-300',
  read: 'bg-gray-800 text-gray-500',
  resolved: 'bg-green-900/50 text-green-400'
};

export default function AlertCenterDashboard({ data }: { data: AlertsData }) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const filtered = useMemo(() => {
    return data.alerts.filter((a: any) => {
      if (filter === 'all') return true;
      if (filter === 'unread') return a.status === 'unread';
      if (filter === 'resolved') return a.status === 'resolved';
      return a.severity === filter;
    });
  }, [data.alerts, filter]);

  const handleMarkRead = (alertId: string) => {
    startTransition(async () => {
      await markAlertAsReadAction(alertId);
      router.refresh();
    });
  };

  const handleResolve = (alertId: string) => {
    const fd = new FormData();
    fd.set('alertId', alertId);
    startTransition(async () => {
      await resolveAlertAction(fd);
      router.refresh();
    });
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createAdminAlertAction(fd);
      if (res?.success) {
        showMsg('success', 'Alert created!');
        setShowCreate(false);
        router.refresh();
      } else {
        showMsg('error', res?.error || 'Failed');
      }
    });
  };

  const filterTabs: { id: FilterType; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: data.stats.total },
    { id: 'critical', label: 'Critical', count: data.stats.critical },
    { id: 'warning', label: 'Warning', count: data.stats.warning },
    { id: 'info', label: 'Info', count: data.alerts.filter((a: any) => a.severity === 'info').length },
    { id: 'unread', label: 'Unread', count: data.stats.unread },
    { id: 'resolved', label: 'Resolved', count: data.stats.resolved }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Alert Center</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time system alerts and notifications</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3A6B1C] hover:bg-[#2D5016] text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Create Alert
        </button>
      </div>

      <div className="space-y-6">
        {/* Notification */}
        {msg && (
          <div className={`rounded-xl px-5 py-3 text-sm font-medium flex items-center gap-2 ${
            msg.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-800' : 'bg-red-900/20 text-red-400 border border-red-800'
          }`}>
            {msg.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {msg.text}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: data.stats.total, color: 'text-gray-300', bg: 'bg-gray-800' },
            { label: 'Unread', value: data.stats.unread, color: 'text-amber-400', bg: 'bg-amber-900/20 border border-amber-800/40' },
            { label: 'Critical', value: data.stats.critical, color: 'text-red-400', bg: 'bg-red-900/20 border border-red-800/40' },
            { label: 'Warning', value: data.stats.warning, color: 'text-orange-400', bg: 'bg-orange-900/20 border border-orange-800/40' },
            { label: 'Resolved', value: data.stats.resolved, color: 'text-green-400', bg: 'bg-green-900/20 border border-green-800/40' }
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-4`}>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-gray-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                filter === t.id
                  ? 'bg-[#3A6B1C] text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === t.id ? 'bg-white/20' : 'bg-gray-700'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Alert List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-gray-900 rounded-2xl py-20 text-center border border-gray-800">
              <Bell size={48} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No alerts found</p>
              <p className="text-gray-600 text-sm">System is running smoothly</p>
            </div>
          ) : (
            filtered.map((alert: any) => (
              <div
                key={alert.id}
                className={`rounded-xl border-l-4 border border-gray-800 p-5 transition-all ${
                  severityStyles[alert.severity] || 'border-gray-600 bg-gray-900/20'
                } ${alert.status === 'unread' ? 'shadow-lg' : 'opacity-80'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${severityBadge[alert.severity] || 'bg-gray-800 text-gray-400'}`}>
                        {alert.severity}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[alert.status] || 'bg-gray-800 text-gray-400'}`}>
                        {alert.status}
                      </span>
                      {alert.alert_type && (
                        <span className="text-xs text-gray-500 font-mono bg-gray-800 px-2 py-0.5 rounded">
                          {alert.alert_type}
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-semibold mb-1">{alert.title}</h3>
                    <p className="text-gray-400 text-sm">{alert.message}</p>
                    {alert.entity_type && (
                      <p className="text-gray-600 text-xs mt-1">
                        Entity: {alert.entity_type} {alert.entity_id ? `· ${alert.entity_id.slice(0, 8)}…` : ''}
                      </p>
                    )}
                    <p className="text-gray-600 text-xs mt-2">{timeAgo(alert.created_at)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {alert.status === 'unread' && (
                      <button
                        onClick={() => handleMarkRead(alert.id)}
                        disabled={isPending}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs font-medium transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                    {alert.status !== 'resolved' && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        disabled={isPending}
                        className="px-3 py-1.5 bg-green-900/50 hover:bg-green-800 text-green-400 rounded-lg text-xs font-medium transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Alert Slide Panel */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6">
          <div className="bg-[#1C1C1E] rounded-2xl border border-gray-700 w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                <ShieldAlert size={20} className="text-amber-400" /> Create Manual Alert
              </h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">Alert Type</label>
                <input name="alertType" type="text" placeholder="e.g. low_stock, maintenance" required
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:border-[#3A6B1C] outline-none" />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Severity</label>
                <select name="severity" className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:border-[#3A6B1C] outline-none">
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Title</label>
                <input name="title" type="text" placeholder="Alert title" required
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:border-[#3A6B1C] outline-none" />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Message</label>
                <textarea name="message" rows={3} placeholder="Alert details…" required
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:border-[#3A6B1C] outline-none resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={isPending}
                  className="flex-1 py-3 bg-[#3A6B1C] hover:bg-[#2D5016] text-white rounded-xl font-medium transition-colors disabled:opacity-50">
                  {isPending ? 'Creating…' : 'Create Alert'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-6 py-3 bg-gray-800 text-gray-400 rounded-xl font-medium hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
