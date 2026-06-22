'use client';

import { useState } from 'react';
import { Users, TrendingUp, MessageCircle, Mail, Phone } from 'lucide-react';

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

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  icon: any;
  subtitle?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
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
        return <MessageCircle className="w-4 h-4" />;
      case 'contact_form':
        return <Mail className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Leads Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Leads"
          value={data.stats.total}
          icon={Users}
          subtitle={`${data.stats.converted} converted`}
        />
        <StatCard
          title="Conversion Rate"
          value={`${data.stats.conversionRate.toFixed(1)}%`}
          icon={TrendingUp}
          subtitle="Lead to customer"
        />
        <StatCard
          title="WhatsApp Leads"
          value={data.stats.bySource['whatsapp'] || 0}
          icon={MessageCircle}
          subtitle={`${data.stats.bySource['contact_form'] || 0} from forms`}
        />
      </div>

      {/* Source Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Leads by Source</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data.stats.bySource).map(([source, count]) => (
            <div key={source} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              {getSourceIcon(source)}
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {source.replace(/_/g, ' ')}
                </p>
                <p className="text-2xl font-bold text-indigo-600">{count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">All Leads</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({data.leads.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'pending'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending ({data.leads.filter(l => !l.converted).length})
              </button>
              <button
                onClick={() => setFilter('converted')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'converted'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Converted ({data.stats.converted})
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Source</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Message</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {lead.name || 'Anonymous'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      {lead.email && (
                        <div className="text-gray-900">{lead.email}</div>
                      )}
                      {lead.phone && (
                        <div className="text-gray-600">{lead.phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getSourceIcon(lead.source)}
                      <span className="text-sm text-gray-700 capitalize">
                        {lead.source.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {(lead.products as any)?.name || '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                    {lead.message || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      lead.converted
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {lead.converted ? 'Converted' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Customers */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Customers</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Orders</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Spent</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.recentCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {customer.name || 'Customer'}
                      </p>
                      <p className="text-xs text-gray-500">{customer.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-right">
                    {customer.total_orders}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium text-right">
                    {formatCurrency(Number(customer.total_spent))}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-right">
                    {new Date(customer.created_at).toLocaleDateString()}
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
