'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Calendar,
  Send,
  Eye,
  Plus,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  generateDailyReportAction,
  generateWeeklyReportAction,
  sendDailyReportManuallyAction,
  subscribeToReportsAction,
  unsubscribeFromReportsAction
} from '@/actions/reports';

type Tab = 'subscriptions' | 'logs';

interface Props {
  data: {
    subscriptions: any[];
    recentReports: any[];
  };
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export default function ReportsDashboard({ data }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('subscriptions');
  const [dailyPreview, setDailyPreview] = useState<any | null>(null);
  const [weeklyPreview, setWeeklyPreview] = useState<any | null>(null);
  const [manualEmail, setManualEmail] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleGenerateDaily = () => {
    startTransition(async () => {
      const res = await generateDailyReportAction();
      if (res && 'date' in res) {
        setDailyPreview(res);
        showMsg('success', 'Daily report generated!');
      } else {
        showMsg('error', 'Failed to generate daily report');
      }
    });
  };

  const handleGenerateWeekly = () => {
    startTransition(async () => {
      const res = await generateWeeklyReportAction();
      if (res && 'weekStart' in res) {
        setWeeklyPreview(res);
        showMsg('success', 'Weekly report generated!');
      } else {
        showMsg('error', 'Failed to generate weekly report');
      }
    });
  };

  const handleManualSend = () => {
    if (!manualEmail) return;
    startTransition(async () => {
      const res = await sendDailyReportManuallyAction(manualEmail);
      if (res?.success) {
        showMsg('success', `Report sent to ${manualEmail}`);
        setManualEmail('');
      } else {
        const errMsg = 'error' in res ? (res as any).error : 'Failed to send';
        showMsg('error', errMsg || 'Failed to send');
      }
    });
  };

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await subscribeToReportsAction(fd);
      if ((res as any)?.success !== false) {
        showMsg('success', 'Subscribed successfully!');
        router.refresh();
        (e.target as HTMLFormElement).reset();
      } else {
        showMsg('error', 'Failed to subscribe');
      }
    });
  };

  const handleToggleSub = (id: string) => {
    startTransition(async () => {
      const res = await unsubscribeFromReportsAction(id);
      if ((res as any)?.success !== false) {
        showMsg('success', 'Subscription updated!');
        router.refresh();
      } else {
        showMsg('error', 'Failed to update subscription');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Reports &amp; Automation</h1>
        <p className="text-gray-400 text-sm mt-1">Configure and send business reports.</p>
      </div>

      {msg && (
        <div className={`rounded-xl px-5 py-3 text-sm font-medium flex items-center gap-2 border ${
          msg.type === 'success' 
            ? 'bg-green-950/40 text-green-400 border-green-800' 
            : 'bg-red-950/40 text-red-400 border-red-800'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {msg.text}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Preview */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={18} className="text-[#3A6B1C]" />
            <h3 className="font-semibold text-white">Daily Report</h3>
          </div>
          <p className="text-gray-500 text-sm mb-4">Preview today's business metrics report</p>
          <button
            onClick={handleGenerateDaily}
            disabled={isPending}
            className="w-full py-2 bg-forest-green hover:bg-forest-green/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Eye size={15} /> {isPending ? 'Generating…' : 'Generate Preview'}
          </button>
          {dailyPreview && (
            <pre className="mt-3 bg-black text-green-400 border border-gray-800 rounded-lg p-3 text-xs overflow-auto max-h-48">
              {JSON.stringify(dailyPreview, null, 2)}
            </pre>
          )}
        </div>

        {/* Weekly Preview */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={18} className="text-[#D4A017]" />
            <h3 className="font-semibold text-white">Weekly Report</h3>
          </div>
          <p className="text-gray-500 text-sm mb-4">Preview this week's business summary report</p>
          <button
            onClick={handleGenerateWeekly}
            disabled={isPending}
            className="w-full py-2 bg-[#D4A017] hover:bg-[#C8860A] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Eye size={15} /> {isPending ? 'Generating…' : 'Generate Preview'}
          </button>
          {weeklyPreview && (
            <pre className="mt-3 bg-black text-amber-400 border border-gray-800 rounded-lg p-3 text-xs overflow-auto max-h-48">
              {JSON.stringify(weeklyPreview, null, 2)}
            </pre>
          )}
        </div>

        {/* Manual Send */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Send size={18} className="text-blue-400" />
            <h3 className="font-semibold text-white">Manual Send</h3>
          </div>
          <p className="text-gray-500 text-sm mb-4">Send a daily report to any email immediately</p>
          <input
            type="email"
            value={manualEmail}
            onChange={(e) => setManualEmail(e.target.value)}
            placeholder="admin@company.com"
            className="w-full bg-black border border-gray-700 text-white rounded-lg px-3 py-2 text-sm mb-3 focus:border-forest-green outline-none"
          />
          <button
            onClick={handleManualSend}
            disabled={isPending || !manualEmail}
            className="w-full py-2 bg-blue-900/40 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 border border-blue-900/60"
          >
            <Send size={15} /> {isPending ? 'Sending…' : 'Send Now'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 rounded-xl p-1 w-fit border border-gray-800 shadow-sm">
        {(['subscriptions', 'logs'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t ? 'bg-forest-green text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t === 'subscriptions' ? `Subscriptions (${data.subscriptions.length})` : `Logs (${data.recentReports.length})`}
          </button>
        ))}
      </div>

      {/* Subscriptions Tab */}
      {tab === 'subscriptions' && (
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-sm">
            {data.subscriptions.length === 0 ? (
              <div className="py-12 text-center">
                <Calendar size={40} className="text-gray-750 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No subscriptions yet</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Email</th>
                    <th className="px-5 py-3 text-left">Type</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Created</th>
                    <th className="px-5 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-850">
                  {data.subscriptions.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-3 text-gray-200 font-medium">{sub.recipient_email}</td>
                      <td className="px-5 py-3">
                        <span className="capitalize text-xs px-2 py-1 bg-green-950/40 border border-green-900/60 text-green-400 rounded-full font-medium">
                          {sub.report_type}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          sub.enabled ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-500'
                        }`}>
                          {sub.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(sub.created_at)}</td>
                      <td className="px-5 py-3">
                        {sub.enabled && (
                          <button
                            onClick={() => handleToggleSub(sub.id)}
                            disabled={isPending}
                            className="text-xs text-red-400 hover:text-red-500 font-medium transition-colors"
                          >
                            Disable
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Add Subscription */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 shadow-sm max-w-lg">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Plus size={16} className="text-[#3A6B1C]" /> Add Subscription
            </h3>
            <form onSubmit={handleSubscribe} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-gray-400 text-xs block mb-1">Email</label>
                <input name="email" type="email" placeholder="email@example.com" required
                  className="w-full bg-black border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-forest-green outline-none" />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Frequency</label>
                <select name="reportType"
                  className="bg-black border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-forest-green outline-none">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <button type="submit" disabled={isPending}
                className="px-5 py-2 bg-forest-green hover:bg-forest-green/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {isPending ? '…' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {tab === 'logs' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-sm">
          {data.recentReports.length === 0 ? (
            <div className="py-12 text-center">
              <FileText size={40} className="text-gray-750 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No report logs yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-550 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Type</th>
                  <th className="px-5 py-3 text-left">Sent To</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850">
                {data.recentReports.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3 capitalize text-gray-200">{log.report_type}</td>
                    <td className="px-5 py-3 text-gray-400">{log.recipient_email || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        log.status === 'sent' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                      }`}>{log.status}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-550 text-xs">{formatDate(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
