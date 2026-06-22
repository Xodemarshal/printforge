'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, TrendingUp, TrendingDown, Package } from 'lucide-react';

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

export default function ProfitabilityDashboard({ data, days }: Props) {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState(days.toString());

  const handlePeriodChange = (newDays: string) => {
    setSelectedPeriod(newDays);
    router.push(`/admin/profitability?days=${newDays}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const mostProfitable = [...data.productProfitability]
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 10);

  const highestMargin = [...data.productProfitability]
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 10);

  const leastProfitable = [...data.productProfitability]
    .sort((a, b) => a.profit - b.profit)
    .slice(0, 10);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profitability Dashboard</h1>
        
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(Number(data.overview.total_revenue))}
          </p>
          <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(Number(data.overview.total_cost))}
          </p>
          <p className="text-sm text-gray-600 mt-1">Total Cost</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(Number(data.overview.total_profit))}
          </p>
          <p className="text-sm text-gray-600 mt-1">Net Profit</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {Number(data.overview.avg_profit_margin).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600 mt-1">Avg Profit Margin</p>
        </div>
      </div>

      {/* Revenue Per Printer Hour */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Printer Efficiency</h2>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-3xl font-bold text-indigo-600">
              {formatCurrency(data.revenuePerPrinterHour)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Revenue Per Printer Hour</p>
          </div>
        </div>
      </div>

      {/* Most Profitable Products */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Most Profitable Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Cost</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Profit</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Margin %</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Orders</th>
              </tr>
            </thead>
            <tbody>
              {mostProfitable.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{item.product}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-right">
                    {formatCurrency(item.revenue)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-right">
                    {formatCurrency(item.cost)}
                  </td>
                  <td className="py-3 px-4 text-sm text-green-600 font-medium text-right">
                    {formatCurrency(item.profit)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium text-right">
                    {item.margin.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-right">
                    {item.orders}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Highest Margin Products */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Highest Margin Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Margin %</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Profit</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Orders</th>
              </tr>
            </thead>
            <tbody>
              {highestMargin.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{item.product}</td>
                  <td className="py-3 px-4 text-sm text-green-600 font-bold text-right">
                    {item.margin.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-right">
                    {formatCurrency(item.profit)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-right">
                    {item.orders}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Least Profitable Products */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Least Profitable Products (Needs Attention)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Cost</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Profit</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Margin %</th>
              </tr>
            </thead>
            <tbody>
              {leastProfitable.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{item.product}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-right">
                    {formatCurrency(item.revenue)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-right">
                    {formatCurrency(item.cost)}
                  </td>
                  <td className={`py-3 px-4 text-sm font-medium text-right ${
                    item.profit < 0 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {formatCurrency(item.profit)}
                  </td>
                  <td className={`py-3 px-4 text-sm font-medium text-right ${
                    item.margin < 20 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {item.margin.toFixed(1)}%
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
