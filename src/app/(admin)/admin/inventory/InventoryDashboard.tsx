'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Save,
  XCircle
} from 'lucide-react';
import { updateInventoryAction, addInventoryItemAction } from '@/actions/inventory';

type InventoryItem = {
  id: string;
  material: string;
  quantity: number;
  threshold: number;
  unit?: string;
  notes?: string;
};

export default function InventoryDashboard({ items }: { items: InventoryItem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const filtered = items.filter(item =>
    !search || item.material.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = items.filter(i => i.quantity < i.threshold).length;
  const ok = items.filter(i => i.quantity >= i.threshold).length;
  const critical = items.filter(i => i.quantity === 0).length;

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateInventoryAction(fd);
      if ((res as any)?.success !== false) {
        showMsg('success', 'Inventory updated!');
        router.refresh();
      } else {
        showMsg('error', 'Failed to update');
      }
    });
  };

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addInventoryItemAction(fd);
      if ((res as any)?.success !== false) {
        showMsg('success', 'Material added!');
        setShowAdd(false);
        router.refresh();
        (e.target as HTMLFormElement).reset();
      } else {
        showMsg('error', 'Failed to add material');
      }
    });
  };

  function stockColor(qty: number, threshold: number) {
    if (qty === 0) return { bar: 'bg-red-500', text: 'text-red-400', badge: 'bg-red-900/40 text-red-400', label: 'Out of Stock' };
    if (qty < threshold) return { bar: 'bg-amber-500', text: 'text-amber-400', badge: 'bg-amber-900/40 text-amber-400', label: 'Low Stock' };
    return { bar: 'bg-forest-green', text: 'text-green-400', badge: 'bg-green-900/40 text-green-400', label: 'OK' };
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-yellow-500/80 mb-1">PrintForge Admin</p>
          <h1 className="text-3xl font-bold text-white">Material Inventory</h1>
          <p className="text-gray-400 mt-1 text-sm">Track filament and materials stock levels.</p>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-forest-green hover:bg-forest-green/90 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Add Material
        </button>
      </div>

      {/* Notification */}
      {msg && (
        <div className={`rounded-lg px-5 py-3 text-sm font-medium flex items-center gap-2 border ${
          msg.type === 'success' 
            ? 'bg-green-950/40 text-green-400 border-green-800' 
            : 'bg-red-950/40 text-red-400 border-red-800'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {msg.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <CheckCircle2 size={18} className="text-green-400 mb-2" />
          <p className="text-2xl font-bold text-white">{ok}</p>
          <p className="text-gray-400 text-xs mt-1">Well Stocked</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <AlertTriangle size={18} className="text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-white">{lowStock}</p>
          <p className="text-gray-400 text-xs mt-1">Low Stock</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <XCircle size={18} className="text-red-400 mb-2" />
          <p className="text-2xl font-bold text-white">{critical}</p>
          <p className="text-gray-400 text-xs mt-1">Out of Stock</p>
        </div>
      </div>

      {/* Add Material Form */}
      {showAdd && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Plus size={16} className="text-[#D4A017]" /> Add New Material
          </h3>
          <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input name="material" placeholder="Material name (e.g. PLA Black)" required
              className="bg-black border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-forest-green outline-none" />
            <input name="quantity" type="number" min="0" placeholder="Quantity" required
              className="bg-black border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-forest-green outline-none" />
            <input name="threshold" type="number" min="0" placeholder="Low stock threshold" required
              className="bg-black border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-forest-green outline-none" />
            <input name="unit" placeholder="Unit (g, rolls, pcs)" 
              className="bg-black border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-forest-green outline-none" />
            <div className="md:col-span-3">
              <input name="notes" placeholder="Notes (optional)"
                className="w-full bg-black border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-forest-green outline-none" />
            </div>
            <button type="submit" disabled={isPending}
              className="py-2 bg-forest-green hover:bg-forest-green/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {isPending ? 'Adding…' : 'Add Material'}
            </button>
          </form>
        </div>
      )}

      {/* Search + Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-3">
          <Search size={15} className="text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search materials…"
            className="bg-transparent text-white text-sm outline-none flex-1 placeholder:text-gray-600"
          />
          <span className="text-gray-500 text-xs">{filtered.length} items</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Layers size={40} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No materials found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filtered.map(item => {
              const c = stockColor(item.quantity, item.threshold);
              const fillPct = item.threshold > 0
                ? Math.min(100, (item.quantity / (item.threshold * 2)) * 100)
                : 100;
              return (
                <div key={item.id} className="px-5 py-4 hover:bg-gray-800/40 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Name + status */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-gray-100 font-medium text-sm">{item.material}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>
                          {c.label}
                        </span>
                      </div>
                      {/* Stock bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-black rounded-full overflow-hidden">
                          <div className={`h-1.5 ${c.bar} rounded-full transition-all`}
                            style={{ width: `${fillPct}%` }} />
                        </div>
                        <span className={`text-xs font-mono font-semibold w-20 text-right ${c.text}`}>
                          {item.quantity} / {item.threshold} {item.unit || ''}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-gray-500 text-xs mt-1">{item.notes}</p>
                      )}
                    </div>

                    {/* Inline update form */}
                    <form onSubmit={handleUpdate} className="flex items-center gap-2 shrink-0">
                      <input type="hidden" name="id" value={item.id} />
                      <div className="text-right">
                        <p className="text-gray-500 text-xs mb-1">Qty</p>
                        <input
                          name="quantity"
                          type="number"
                          defaultValue={item.quantity}
                          min="0"
                          className="w-20 bg-black border border-gray-700 text-white rounded-lg px-2 py-1.5 text-sm focus:border-forest-green outline-none text-center"
                        />
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-xs mb-1">Threshold</p>
                        <input
                          name="threshold"
                          type="number"
                          defaultValue={item.threshold}
                          min="0"
                          className="w-20 bg-black border border-gray-700 text-white rounded-lg px-2 py-1.5 text-sm focus:border-forest-green outline-none text-center"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="mt-4 p-2 bg-forest-green/20 hover:bg-forest-green/40 text-green-400 rounded-lg transition-colors disabled:opacity-50"
                        title="Save"
                      >
                        <Save size={14} />
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
