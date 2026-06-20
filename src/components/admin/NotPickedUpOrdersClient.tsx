"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Printer, Package, ExternalLink } from "lucide-react";

type OrderRow = {
  id: string;
  status?: string | null;
  shiprocket_status?: string | null;
  shiprocket_pickup_status?: string | null;
  shiprocket_awb_number?: string | null;
  shiprocket_courier_name?: string | null;
  shiprocket_label_pdf_url?: string | null;
  shiprocket_tracking_url?: string | null;
  total_amount?: number | null;
  created_at?: string | null;
  users?: {
    name?: string | null;
    email?: string | null;
  } | null;
};

function openPrintWindow(title: string, orders: OrderRow[]) {
  const popup = window.open("", "_blank", "noopener,noreferrer,width=1200,height=800");
  if (!popup) return;

  popup.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          h1 { font-size: 24px; margin-bottom: 12px; }
          .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
          .card { border: 1px solid #d1d5db; border-radius: 16px; padding: 16px; break-inside: avoid; }
          .meta { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.14em; }
          .value { margin-top: 4px; font-size: 15px; }
          .label { font-family: monospace; font-size: 14px; word-break: break-all; }
          @media print { button { display: none; } body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="grid">
          ${orders.map((order) => order.shiprocket_label_pdf_url ? `
            <div class="card" style="grid-column: span 2;">
              <div class="meta">Order #${order.id.slice(0, 8)}</div>
              <div class="value" style="margin-bottom:12px;">Label preview</div>
              <iframe src="${order.shiprocket_label_pdf_url}" style="width:100%;height:560px;border:0;"></iframe>
            </div>
          ` : `
            <div class="card">
              <div class="meta">Order</div>
              <div class="value">#${order.id.slice(0, 8)}</div>
              <div class="meta" style="margin-top:12px;">Customer</div>
              <div class="value">${order.users?.name ?? "Customer"} (${order.users?.email ?? "N/A"})</div>
              <div class="meta" style="margin-top:12px;">AWB</div>
              <div class="value label">${order.shiprocket_awb_number ?? "Pending"}</div>
              <div class="meta" style="margin-top:12px;">Courier</div>
              <div class="value">${order.shiprocket_courier_name ?? "Auto assigned"}</div>
              <div class="meta" style="margin-top:12px;">Label</div>
              <div class="value">${order.shiprocket_label_pdf_url ? "Available" : "Pending"}</div>
            </div>
          `).join("")}
        </div>
        <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
      </body>
    </html>
  `);
  popup.document.close();
}

export function NotPickedUpOrdersClient({ orders }: { orders: OrderRow[] }) {
  const [selected, setSelected] = useState<string[]>([]);

  const allSelected = orders.length > 0 && selected.length === orders.length;
  const selectedOrders = useMemo(() => orders.filter((order) => selected.includes(order.id)), [orders, selected]);

  const toggleAll = () => {
    setSelected(allSelected ? [] : orders.map((order) => order.id));
  };

  const toggleOne = (id: string) => {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const printOrders = (items: OrderRow[]) => {
    if (items.length === 0) return;
    openPrintWindow("Shiprocket Pending Pickup Orders", items);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={() => printOrders(orders)} className="bg-forest-green hover:bg-forest-green/90 text-white">
          <Printer size={16} />
          Print All Pending Orders
        </Button>
        <Button type="button" onClick={() => printOrders(selectedOrders)} variant="outline" className="border-gray-700 text-gray-200 hover:border-gray-500 hover:text-white">
          <Printer size={16} />
          Print Selected Orders
        </Button>
        <span className="text-sm text-gray-400">{selected.length} selected</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full">
          <thead className="bg-black border-b border-gray-800">
            <tr>
              <th className="px-4 py-3 text-left">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
              <th className="px-4 py-3 text-left text-sm text-gray-300">Order</th>
              <th className="px-4 py-3 text-left text-sm text-gray-300">Customer</th>
              <th className="px-4 py-3 text-left text-sm text-gray-300">AWB</th>
              <th className="px-4 py-3 text-left text-sm text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm text-gray-300">Courier</th>
              <th className="px-4 py-3 text-left text-sm text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-900">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-4">
                  <input type="checkbox" checked={selected.includes(order.id)} onChange={() => toggleOne(order.id)} />
                </td>
                <td className="px-4 py-4 text-sm font-mono text-white">#{order.id.slice(0, 8)}</td>
                <td className="px-4 py-4 text-sm text-gray-200">
                  <div>{order.users?.name ?? "Customer"}</div>
                  <div className="text-xs text-gray-500">{order.users?.email ?? "N/A"}</div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-200 font-mono">{order.shiprocket_awb_number || "Pending"}</td>
                <td className="px-4 py-4 text-sm text-gray-300 capitalize">
                  {String(order.shiprocket_status || order.shiprocket_pickup_status || "not picked up").replace(/_/g, " ")}
                </td>
                <td className="px-4 py-4 text-sm text-gray-300">{order.shiprocket_courier_name || "Auto assigned"}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {order.shiprocket_label_pdf_url && (
                      <button
                        type="button"
                        onClick={() => window.open(order.shiprocket_label_pdf_url!, "_blank", "noopener,noreferrer")}
                        className="inline-flex items-center gap-1 text-xs text-forest-green hover:text-forest-green/80"
                      >
                        <ExternalLink size={12} />
                        Label
                      </button>
                    )}
                    {order.shiprocket_tracking_url && (
                      <a href={order.shiprocket_tracking_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-gray-300 hover:text-white">
                        <ExternalLink size={12} />
                        Track
                      </a>
                    )}
                    <button type="button" onClick={() => printOrders([order])} className="inline-flex items-center gap-1 text-xs text-gray-300 hover:text-white">
                      <Printer size={12} />
                      Print
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-800 p-10 text-center text-gray-400">
          <Package size={32} className="mx-auto mb-3" />
          No pending pickup orders.
        </div>
      )}
    </div>
  );
}
