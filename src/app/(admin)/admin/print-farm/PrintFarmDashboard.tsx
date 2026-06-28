'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Layers,
  Play,
  ChevronRight,
  AlertTriangle,
  PackageCheck
} from 'lucide-react';
import {
  startPrintJobAction,
  completePrintJobAction,
  failPrintJobAction
} from '@/actions/printFarm';

type PrintFarmData = {
  stats: {
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
    successRate: number;
    avgPrintHours: number;
    totalFilament: number;
  };
  activeJobsList: any[];
  recentJobs: any[];
  pendingOrders: any[];
};

type Tab = 'active' | 'history' | 'start';

function formatDuration(startedAt: string) {
  const diff = Date.now() - new Date(startedAt).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function PrintFarmDashboard({ data }: { data: PrintFarmData }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('active');
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [expandType, setExpandType] = useState<'complete' | 'fail' | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  async function handleComplete(e: React.FormEvent<HTMLFormElement>, jobId: string) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set('printJobId', jobId);
    startTransition(async () => {
      const res = await completePrintJobAction(fd);
      if (res?.success) {
        showMsg('success', 'Print job marked complete!');
        setExpandedJob(null);
        router.refresh();
      } else {
        showMsg('error', res?.error || 'Failed');
      }
    });
  }

  async function handleFail(e: React.FormEvent<HTMLFormElement>, jobId: string) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set('printJobId', jobId);
    startTransition(async () => {
      const res = await failPrintJobAction(fd);
      if (res?.success) {
        showMsg('success', 'Job marked as failed.');
        setExpandedJob(null);
        router.refresh();
      } else {
        showMsg('error', res?.error || 'Failed');
      }
    });
  }

  async function handleStart(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await startPrintJobAction(fd);
      if (res?.success) {
        showMsg('success', 'Print job started!');
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } else {
        showMsg('error', res?.error || 'Failed');
      }
    });
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'active', label: `Active Jobs (${data.stats.activeJobs})` },
    { id: 'history', label: `History (${data.stats.totalJobs})` },
    { id: 'start', label: 'Start New Job' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Print Farm Control Center</h1>
        <p className="text-gray-400 text-sm mt-1">Monitor active print jobs and manage your printers</p>
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

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: 'Total Jobs', value: data.stats.totalJobs, icon: Layers, color: 'text-gray-400' },
            { label: 'Active', value: data.stats.activeJobs, icon: Zap, color: 'text-blue-400' },
            { label: 'Completed', value: data.stats.completedJobs, icon: CheckCircle2, color: 'text-green-400' },
            { label: 'Failed', value: data.stats.failedJobs, icon: XCircle, color: 'text-red-400' },
            { label: 'Success Rate', value: `${data.stats.successRate.toFixed(1)}%`, icon: PackageCheck, color: data.stats.successRate >= 80 ? 'text-green-400' : 'text-amber-400' },
            { label: 'Avg Hours', value: `${data.stats.avgPrintHours.toFixed(1)}h`, icon: Clock, color: 'text-purple-400' },
            { label: 'Filament (g)', value: `${data.stats.totalFilament.toFixed(0)}g`, icon: Printer, color: 'text-amber-400' }
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#1C1C1E] rounded-xl p-4 border border-gray-800">
              <Icon size={18} className={`${color} mb-2`} />
              <p className="text-white font-bold text-lg">{value}</p>
              <p className="text-gray-500 text-xs">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#1C1C1E] rounded-xl p-1 w-fit border border-gray-800">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-[#3A6B1C] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Active Jobs Tab */}
        {tab === 'active' && (
          <div className="bg-[#1C1C1E] rounded-2xl border border-gray-800 overflow-hidden">
            {data.activeJobsList.length === 0 ? (
              <div className="py-20 text-center">
                <Printer size={48} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No active print jobs</p>
                <p className="text-gray-600 text-sm">All printers are idle</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Order</th>
                    <th className="px-5 py-3 text-left">Customer</th>
                    <th className="px-5 py-3 text-left">Printer</th>
                    <th className="px-5 py-3 text-left">Started</th>
                    <th className="px-5 py-3 text-left">Running</th>
                    <th className="px-5 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.activeJobsList.map((job: any) => (
                    <>
                      <tr key={job.id} className="border-b border-gray-900 hover:bg-gray-900/40 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs text-amber-400">{job.order_id?.slice(0, 8)}…</td>
                        <td className="px-5 py-4 text-gray-200">{job.orders?.customer_name || '—'}</td>
                        <td className="px-5 py-4">
                          <span className="bg-blue-900/40 text-blue-300 px-2 py-1 rounded text-xs">{job.printer_name}</span>
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-xs">{formatDate(job.started_at)}</td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1 text-green-400 text-xs">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            {formatDuration(job.started_at)}
                          </span>
                        </td>
                        <td className="px-5 py-4 flex gap-2">
                          <button
                            onClick={() => { setExpandedJob(job.id); setExpandType('complete'); }}
                            className="px-3 py-1.5 bg-green-800/50 hover:bg-green-700 text-green-300 rounded-lg text-xs font-medium transition-colors"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => { setExpandedJob(job.id); setExpandType('fail'); }}
                            className="px-3 py-1.5 bg-red-900/40 hover:bg-red-800 text-red-300 rounded-lg text-xs font-medium transition-colors"
                          >
                            Fail
                          </button>
                        </td>
                      </tr>
                      {expandedJob === job.id && expandType === 'complete' && (
                        <tr key={`${job.id}-complete`} className="bg-green-950/20">
                          <td colSpan={6} className="px-5 py-4">
                            <form onSubmit={(e) => handleComplete(e, job.id)} className="flex gap-4 items-end">
                              <div>
                                <label className="text-gray-400 text-xs block mb-1">Actual Print Hours</label>
                                <input name="actualPrintHours" type="number" step="0.1" min="0" placeholder="e.g. 4.5"
                                  className="bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm w-36" required />
                              </div>
                              <div>
                                <label className="text-gray-400 text-xs block mb-1">Filament Used (g)</label>
                                <input name="filamentUsedGrams" type="number" step="0.1" min="0" placeholder="e.g. 120"
                                  className="bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm w-36" required />
                              </div>
                              <button type="submit" disabled={isPending}
                                className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                                {isPending ? 'Saving…' : 'Confirm Complete'}
                              </button>
                              <button type="button" onClick={() => setExpandedJob(null)}
                                className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm">Cancel</button>
                            </form>
                          </td>
                        </tr>
                      )}
                      {expandedJob === job.id && expandType === 'fail' && (
                        <tr key={`${job.id}-fail`} className="bg-red-950/20">
                          <td colSpan={6} className="px-5 py-4">
                            <form onSubmit={(e) => handleFail(e, job.id)} className="flex gap-4 items-end">
                              <div className="flex-1">
                                <label className="text-gray-400 text-xs block mb-1">Failure Reason</label>
                                <input name="failureReason" type="text" placeholder="e.g. Filament jam on layer 42"
                                  className="bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm w-full" required />
                              </div>
                              <button type="submit" disabled={isPending}
                                className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                                {isPending ? 'Saving…' : 'Mark Failed'}
                              </button>
                              <button type="button" onClick={() => setExpandedJob(null)}
                                className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm">Cancel</button>
                            </form>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* History Tab */}
        {tab === 'history' && (
          <div className="bg-[#1C1C1E] rounded-2xl border border-gray-800 overflow-hidden">
            {data.recentJobs.length === 0 ? (
              <div className="py-20 text-center">
                <Layers size={48} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400">No print jobs yet</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Order</th>
                    <th className="px-5 py-3 text-left">Customer</th>
                    <th className="px-5 py-3 text-left">Printer</th>
                    <th className="px-5 py-3 text-left">Hours</th>
                    <th className="px-5 py-3 text-left">Filament</th>
                    <th className="px-5 py-3 text-left">Started</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentJobs.map((job: any) => {
                    const status = job.failed ? 'failed' : job.completed_at ? 'completed' : 'active';
                    return (
                      <tr key={job.id} className="border-b border-gray-900 hover:bg-gray-900/30 transition-colors">
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            status === 'completed' ? 'bg-green-900/40 text-green-400' :
                            status === 'failed' ? 'bg-red-900/40 text-red-400' :
                            'bg-blue-900/40 text-blue-400'
                          }`}>{status}</span>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-amber-400">{job.order_id?.slice(0, 8)}…</td>
                        <td className="px-5 py-4 text-gray-200">{job.orders?.customer_name || '—'}</td>
                        <td className="px-5 py-4 text-gray-400">{job.printer_name}</td>
                        <td className="px-5 py-4 text-gray-400">{job.actual_print_hours ? `${Number(job.actual_print_hours).toFixed(1)}h` : '—'}</td>
                        <td className="px-5 py-4 text-gray-400">{job.filament_used_grams ? `${Number(job.filament_used_grams).toFixed(0)}g` : '—'}</td>
                        <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(job.started_at || job.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Start Job Tab */}
        {tab === 'start' && (
          <div className="max-w-lg">
            <div className="bg-[#1C1C1E] rounded-2xl border border-gray-800 p-6">
              <h2 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
                <Play size={18} className="text-[#D4A017]" /> Start New Print Job
              </h2>
              <form onSubmit={handleStart} className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Select Order</label>
                  <select name="orderId" required
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:border-[#3A6B1C] outline-none">
                    <option value="">— Choose an order —</option>
                    {data.pendingOrders.map((o: any) => (
                      <option key={o.id} value={o.id}>
                        {o.customer_name} — ₹{Number(o.total_amount).toLocaleString('en-IN')} ({o.id.slice(0, 8)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Printer Name</label>
                  <input name="printerName" type="text" placeholder="e.g. Printer-1, Bambu-A1"
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:border-[#3A6B1C] outline-none"
                    required />
                </div>
                <button type="submit" disabled={isPending}
                  className="w-full py-3 bg-[#3A6B1C] hover:bg-[#2D5016] text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {isPending ? 'Starting…' : <><Play size={16} /> Start Print Job</>}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
