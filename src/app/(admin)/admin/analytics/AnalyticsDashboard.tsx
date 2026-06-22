'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  ShoppingBag,
  MessageCircle,
  Mail
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    revenueToday: number;
    totalOrders: number;
    avgOrderValue: number;
    conversionRate: number;
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    totalAbandoned: number;
    recoveredCarts: number;
    recoveredRevenue: number;
    whatsappClicks: number;
    contactFormSubmits: number;
  };
  productPerformance: any[];
  conversionFunnel: any[];
  topCustomers: any[];
  orders: any[];
}

interface Props {
  data: AnalyticsData;
  days: number;
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  subtitle,
  trend 
}: { 
  title: string; 
  value: string | number; 
  icon: any;
  subtitle?: string;
  trend?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
        {trend && (
          <span className="text-sm text-green-600 font-medium">{trend}</span>
        )}
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

export default function AnalyticsDashboard({ data, days }: Props) {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState(days.toString());

  const handlePeriodChange = (newDays: string) => {
    setSelectedPeriod(newDays);
    router.push(`/admin/analytics?days=${newDays}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const recoveryRate = data.overview.totalAbandoned > 0 
    ? ((data.overview.recoveredCarts / data.overview.totalAbandoned) * 100).toFixed(1)
    : '0';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        
        <div className="flex gap-2">
          {['7', '30', '90'].map(period => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period} Days
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data.overview.totalRevenue)}
          icon={DollarSign}
          subtitle={`${formatCurrency(data.overview.revenueToday)} today`}
        />
        <StatCard
          title="Total Orders"
          value={data.overview.totalOrders}
          icon={ShoppingBag}
          subtitle={`Avg: ${formatCurrency(data.overview.avgOrderValue)}`}
        />
        <StatCard
          title="Conversion Rate"
          value={`${data.overview.conversionRate.toFixed(2)}%`}
          icon={TrendingUp}
          subtitle="Views to purchases"
        />
        <StatCard
          title="Total Customers"
          value={data.overview.totalCustomers}
          icon={Users}
          subtitle={`${data.overview.newCustomers} new, ${data.overview.returningCustomers} returning`}
        />
      </div>

      {/* Cart & Lead Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Abandoned Carts"
          value={data.overview.totalAbandoned}
          icon={ShoppingCart}
          subtitle={`${data.overview.recoveredCarts} recovered (${recoveryRate}%)`}
        />
        <StatCard
          title="Recovered Revenue"
          value={formatCurrency(data.overview.recoveredRevenue)}
          icon={DollarSign}
          subtitle="From abandoned carts"
        />
        <StatCard
          title="WhatsApp & Contact"
          value={data.overview.whatsappClicks + data.overview.contactFormSubmits}
          icon={MessageCircle}
          subtitle={`${data.overview.whatsappClicks} WhatsApp, ${data.overview.contactFormSubmits} forms`}
        />
      </div>

      {/* Conversion Funnel */}
      {data.conversionFunnel.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Conversion Funnel</h2>
          <div className="space-y-4">
            {data.conversionFunnel.map((step, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {step.step.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm text-gray-600">
                    {step.count} ({step.conversion_rate}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-indigo-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(step.conversion_rate, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Performance */}
      {data.productPerformance.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Product Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Views</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Add to Cart</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Purchases</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Conv %</th>
                </tr>
              </thead>
              <tbody>
                {data.productPerformance.slice(0, 10).map((product, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{product.product_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-right">{product.views}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-right">{product.adds_to_cart}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-right">{product.purchases}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-right">
                      {formatCurrency(Number(product.revenue))}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-indigo-600 text-right">
                      {product.conversion_rate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Customers */}
      {data.topCustomers.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Customers</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Orders</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Spent</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {data.topCustomers.map((customer, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer.name || 'Customer'}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-right">{customer.total_orders}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium text-right">
                      {formatCurrency(Number(customer.total_spent))}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-right">
                      {customer.last_order_date 
                        ? new Date(customer.last_order_date).toLocaleDateString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
