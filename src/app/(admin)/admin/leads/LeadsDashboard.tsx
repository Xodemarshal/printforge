'use client';

import { useState } from 'react';
import { Users, TrendingUp, MessageCircle, Mail, Phone, ArrowUpRight } from 'lucide-react';

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  message: string | null;
  converted: boolean;
  created_at: string;
  products?: { name: string } | null;
}

interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  total_orders: number;
  total_spent: number;
  created_at: string;
}

interface Props {
  data: {
    leads: Lead[];
    stats: {
      total: number;
      converted: number;
      conversionRate: number;
      bySource: Record<string, number>;
    };
    recentCustomers: Customer[];
  };
}

export default function LeadsDashboard({ data }: Props) {
  const [filter, setFilter] = useState<'all' | 'converted' | 'pending'>('all');

  const filteredLeads = data.leads.filter(lead => {
    if (filter === 'converted') return lead.converted;
    if (filter === 'pending') return !lead.converted;
    return true;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-green-400" />;
      case 'contact_form':
        return <Mail className="w-4 h-4 text-blue-400" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-purple-400" />;
      default:
        return <Users className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-yellow-500/80 mb-1">PrintForge Admin</p>
        <h1 className="text-3xl font-bold text-white">Leads Management</h1>
        <p className="text-gray-400 mt-1 text-sm">Track customer inquiry sources, conversions, and acquisition channels.</p>
      </div>

      {/* Stats KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <Users size={18} className="text-blue-400 mb-3" />
          <p className="text-2xl font-bold text-blue-400">{data.stats.total}</p>
          <p className="text-white text-sm font-medium mt-1">Total Leads</p>
          <p className="text-gray-500 text-xs mt-0.5">{data.stats.converted} converted to customers</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <TrendingUp size={18} className="text-green-400 mb-3" />
          <p className="text-2xl font-bold text-green-400">{data.stats.conversionRate.toFixed(1)}%</p>
          <p className="text-white text-sm font-medium mt-1">Conversion Rate</p>
          <p className="text-gray-500 text-xs mt-0.5">Inquiries converted to sales</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <MessageCircle size={18} className="text-yellow-400 mb-3" />
          <p className="text-2xl font-bold text-yellow-400">{data.stats.bySource['whatsapp'] || 0}</p>
          <p className="text-white text-sm font-medium mt-1">WhatsApp Inquiries</p>
          <p className="text-gray-500 text-xs mt-0.5">{data.stats.bySource['contact_form'] || 0} from contact forms</p>
        </div>
      </div>

      {/* Source Breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold text-sm">Leads by Source</h2>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(data.stats.bySource).map(([source, count]) => (
            <div key={source} className="flex items-center gap-3 p-3.5 bg-black border border-gray-800 rounded-lg">
              {getSourceIcon(source)}
              <div>
                <p className="text-xs text-gray-400 capitalize">
                  {source.replace(/_/g, ' ')}
                </p>
                <p className="text-xl font-bold text-white mt-0.5">{count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-white font-semibold text-sm">All Lead Records</h2>
          <div className="flex gap-2">
            {(['all', 'pending', 'converted'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  filter === f
                    ? 'bg-green-900/40 text-green-400 border border-green-800/60'
                    : 'bg-black text-gray-400 border border-gray-800 hover:text-white'
                }`}
              >
                {f} ({f === 'all' ? data.leads.length : f === 'pending' ? data.leads.filter(l => !l.converted).length : data.stats.converted})
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Name</th>
                <th className="text-left px-5 py-3 font-medium">Contact</th>
                <th className="text-left px-5 py-3 font-medium">Source</th>
                <th className="text-left px-5 py-3 font-medium">Product</th>
                <th className="text-left px-5 py-3 font-medium">Message</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-right px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-white">
                    {lead.name || 'Anonymous'}
                  </td>
                  <td className="px-5 py-3.5 text-xs">
                    {lead.email && <div className="text-gray-300">{lead.email}</div>}
                    {lead.phone && <div className="text-gray-500 font-mono mt-0.5">{lead.phone}</div>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 text-xs text-gray-300 capitalize">
                      {getSourceIcon(lead.source)}
                      <span>{lead.source.replace(/_/g, ' ')}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">
                    {(lead.products as any)?.name || '—'}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 max-w-xs truncate">
                    {lead.message || '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      lead.converted
                        ? 'bg-green-900/40 text-green-400'
                        : 'bg-yellow-900/40 text-yellow-400'
                    }`}>
                      {lead.converted ? 'Converted' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-gray-500">
                    {new Date(lead.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 text-sm">
                    No leads found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Customers */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold text-sm">Recently Acquired Customers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Customer</th>
                <th className="text-right px-5 py-3 font-medium">Orders</th>
                <th className="text-right px-5 py-3 font-medium">Total Spent</th>
                <th className="text-right px-5 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data.recentCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-white text-sm">
                      {customer.name || 'Customer'}
                    </p>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-right text-gray-300 text-sm">
                    {customer.total_orders}
                  </td>
                  <td className="px-5 py-3.5 text-right text-white font-semibold text-sm">
                    {formatCurrency(Number(customer.total_spent))}
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-gray-500">
                    {new Date(customer.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
