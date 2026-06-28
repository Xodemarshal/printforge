'use client';

import { useState, useMemo } from 'react';
import { ClipboardList, Shield, Search, ChevronDown, ChevronUp, X } from 'lucide-react';

type ActivityData = {
  logs: any[];
  stats: { total: number; today: number; uniqueActions: number; uniqueEntityTypes: number };
  topActions: { action: string; count: number }[];
  entityTypes: string[];
  actions: string[];
};

const PAGE_SIZE = 50;

const entityColors: Record<string, string> = {
  order: 'bg-blue-900/40 text-blue-400',
  product: 'bg-purple-900/40 text-purple-400',
  settings: 'bg-amber-900/40 text-amber-400',
  customer: 'bg-cyan-900/40 text-cyan-400',
  coupon: 'bg-pink-900/40 text-pink-400',
  inventory: 'bg-orange-900/40 text-orange-400'
};

function getEntityColor(type: string) {
  return entityColors[type?.toLowerCase()] || 'bg-gray-800 text-gray-400';
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function ActivityLogDashboard({ data }: { data: ActivityData }) {
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(0);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const maxActionCount = Math.max(...data.topActions.map((a) => a.count), 1);

  const filtered = useMemo(() => {
    return data.logs.filter((log) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        log.action?.toLowerCase().includes(q) ||
        log.entity_type?.toLowerCase().includes(q) ||
        log.entity_id?.toLowerCase().includes(q) ||
        log.ip_address?.includes(q);
      const matchEntity = !entityFilter || log.entity_type === entityFilter;
      const matchAction = !actionFilter || log.action === actionFilter;
      return matchSearch && matchEntity && matchAction;
    });
  }, [data.logs, search, entityFilter, actionFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const clearFilters = () => {
    setSearch('');
    setEntityFilter('');
    setActionFilter('');
    setPage(0);
  };

  const hasFilters = search || entityFilter || actionFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Activity Log</h1>
        <p className="text-gray-400 text-sm mt-1">Complete audit trail of all admin actions</p>
      </div>

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Logged', value: data.stats.total, color: 'text-gray-200' },
            { label: "Today's Actions", value: data.stats.today, color: 'text-[#D4A017]' },
            { label: 'Unique Actions', value: data.stats.uniqueActions, color: 'text-blue-400' },
            { label: 'Entity Types', value: data.stats.uniqueEntityTypes, color: 'text-purple-400' }
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#1C1C1E] rounded-xl p-4 border border-gray-800">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-gray-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Top Actions Bar Chart */}
        {data.topActions.length > 0 && (
          <div className="bg-[#1C1C1E] rounded-2xl p-5 border border-gray-800">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Shield size={16} className="text-[#D4A017]" /> Top Actions
            </h2>
            <div className="space-y-2">
              {data.topActions.map(({ action, count }) => (
                <div key={action} className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#3A6B1C] bg-[#3A6B1C]/10 px-2 py-0.5 rounded w-40 truncate">
                    {action}
                  </span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-[#3A6B1C] rounded-full transition-all"
                      style={{ width: `${(count / maxActionCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-400 text-xs w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-gray-800 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search action, entity, IP…"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-9 pr-4 py-2 text-sm focus:border-[#3A6B1C] outline-none"
            />
          </div>
          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(0); }}
            className="bg-gray-900 border border-gray-700 text-gray-300 rounded-xl px-3 py-2 text-sm focus:border-[#3A6B1C] outline-none"
          >
            <option value="">All Entity Types</option>
            {data.entityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
            className="bg-gray-900 border border-gray-700 text-gray-300 rounded-xl px-3 py-2 text-sm focus:border-[#3A6B1C] outline-none"
          >
            <option value="">All Actions</option>
            {data.actions.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white px-3 py-2 bg-gray-800 rounded-xl transition-colors">
              <X size={14} /> Clear
            </button>
          )}
          <span className="text-gray-500 text-xs">{filtered.length} entries</span>
        </div>

        {/* Log Table */}
        <div className="bg-[#1C1C1E] rounded-2xl border border-gray-800 overflow-hidden">
          {paged.length === 0 ? (
            <div className="py-20 text-center">
              <Shield size={48} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No activity found</p>
              <p className="text-gray-600 text-sm">Actions will appear here automatically when admins perform operations.</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Action</th>
                    <th className="px-4 py-3 text-left">Entity Type</th>
                    <th className="px-4 py-3 text-left">Entity ID</th>
                    <th className="px-4 py-3 text-left">IP</th>
                    <th className="px-4 py-3 text-left">Timestamp</th>
                    <th className="px-4 py-3 text-left">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((log: any, idx: number) => (
                    <>
                      <tr key={log.id} className="border-b border-gray-900 hover:bg-gray-900/30 transition-colors">
                        <td className="px-4 py-3 text-gray-600 text-xs">{page * PAGE_SIZE + idx + 1}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs bg-[#3A6B1C]/15 text-[#3A6B1C] px-2 py-0.5 rounded">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {log.entity_type && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getEntityColor(log.entity_type)}`}>
                              {log.entity_type}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          {log.entity_id ? `${log.entity_id.slice(0, 12)}…` : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs font-mono">{log.ip_address || '—'}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(log.created_at)}</td>
                        <td className="px-4 py-3">
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <button
                              onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                              className="text-gray-500 hover:text-gray-300 transition-colors"
                            >
                              {expandedLog === log.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          )}
                        </td>
                      </tr>
                      {expandedLog === log.id && (
                        <tr key={`${log.id}-meta`} className="bg-gray-900/50">
                          <td colSpan={7} className="px-4 py-3">
                            <pre className="text-xs text-green-400 font-mono bg-gray-950 rounded-lg p-3 overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
                  <span className="text-gray-500 text-xs">
                    Page {page + 1} of {totalPages} ({filtered.length} total)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="px-4 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-xs font-medium disabled:opacity-40 hover:bg-gray-700 transition-colors"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page === totalPages - 1}
                      className="px-4 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-xs font-medium disabled:opacity-40 hover:bg-gray-700 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
