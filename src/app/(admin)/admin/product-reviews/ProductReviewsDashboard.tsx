'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  Star,
  XCircle,
  Send
} from 'lucide-react';
import { approveProductReviewAction, requestReviewAction } from '@/actions/productReviews';

type Tab = 'pending' | 'approved' | 'request';

interface Props {
  data: {
    stats: {
      total: number;
      pending: number;
      approved: number;
      avgRating: number;
    };
    pendingReviews: any[];
    approvedReviews: any[];
    ratingDist: Array<{ rating: number; count: number }>;
    deliveredOrders: any[];
  };
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          className={n <= rating ? 'text-[#D4A017] fill-[#D4A017]' : 'text-gray-800'}
        />
      ))}
    </div>
  );
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export default function ProductReviewsDashboard({ data }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('pending');
  const [requestOrderId, setRequestOrderId] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleApprove = (reviewId: string) => {
    startTransition(async () => {
      const res = await approveProductReviewAction(reviewId);
      if ((res as any)?.success !== false) {
        showMsg('success', 'Review approved!');
        router.refresh();
      } else {
        showMsg('error', (res as any)?.error || 'Failed to approve');
      }
    });
  };

  const handleRequestReview = () => {
    if (!requestOrderId) return;
    startTransition(async () => {
      const res = await requestReviewAction(requestOrderId);
      if (res?.success) {
        showMsg('success', 'Review request email sent!');
        setRequestOrderId('');
      } else {
        showMsg('error', res?.error || 'Failed to send');
      }
    });
  };

  const maxRatingCount = Math.max(...data.ratingDist.map((r) => r.count), 1);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'pending', label: `Pending (${data.stats.pending})` },
    { id: 'approved', label: `Approved (${data.stats.approved})` },
    { id: 'request', label: 'Request Review' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Product Reviews</h1>
        <p className="text-gray-400 text-sm mt-1">Approve and manage customer reviews.</p>
      </div>

      {/* Notification */}
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

      {/* Stats + Rating Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Reviews', value: data.stats.total, icon: MessageSquare, color: 'text-gray-400' },
            { label: 'Pending', value: data.stats.pending, icon: Clock, color: 'text-amber-400' },
            { label: 'Approved', value: data.stats.approved, icon: CheckCircle2, color: 'text-green-400' },
            { label: 'Avg Rating', value: data.stats.avgRating.toFixed(1), icon: Star, color: 'text-[#D4A017]' }
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <Icon size={20} className={`${color} mb-2`} />
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-gray-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Rating Distribution */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h3 className="text-white font-semibold mb-4 text-sm">Rating Distribution</h3>
          <div className="space-y-2">
            {data.ratingDist.map(({ rating, count }) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-gray-405 w-12">
                  <Star size={11} className="text-[#D4A017] fill-[#D4A017]" /> {rating}
                </span>
                <div className="flex-1 h-2 bg-black rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-[#D4A017] rounded-full transition-all"
                    style={{ width: `${(count / maxRatingCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 rounded-xl p-1 w-fit border border-gray-800 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-forest-green text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Pending Tab */}
      {tab === 'pending' && (
        <div className="space-y-4">
          {data.pendingReviews.length === 0 ? (
            <div className="bg-gray-900 rounded-xl p-16 text-center border border-gray-800">
              <CheckCircle2 size={48} className="text-green-400 mx-auto mb-3" />
              <p className="text-white font-semibold text-lg">All reviews approved!</p>
              <p className="text-gray-500 text-sm">No pending reviews in the queue.</p>
            </div>
          ) : (
            data.pendingReviews.map((review: any) => (
              <div key={review.id} className="bg-gray-900 rounded-xl p-5 border-l-4 border-l-[#D4A017] border border-gray-800 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-white">{review.products?.name || 'Unknown Product'}</span>
                      <span className="text-xs px-2 py-0.5 bg-amber-900/30 text-amber-400 rounded-full font-medium">Pending</span>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <StarDisplay rating={review.rating} />
                      <span className="text-gray-500 text-xs">{review.customers?.name || 'Anonymous'} · {formatDate(review.created_at)}</span>
                    </div>
                    {review.review_text && (
                      <p className="text-gray-300 text-sm italic line-clamp-3">"{review.review_text}"</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleApprove(review.id)}
                    disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-forest-green hover:bg-forest-green/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shrink-0"
                  >
                    <CheckCircle2 size={15} /> Approve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Approved Tab */}
      {tab === 'approved' && (
        <div className="space-y-4">
          {data.approvedReviews.length === 0 ? (
            <div className="bg-gray-900 rounded-xl p-16 text-center border border-gray-800">
              <MessageSquare size={48} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">No approved reviews yet.</p>
            </div>
          ) : (
            data.approvedReviews.map((review: any) => (
              <div key={review.id} className="bg-gray-900 rounded-xl p-5 border-l-4 border-l-forest-green border border-gray-800 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-white">{review.products?.name || 'Unknown Product'}</span>
                      <span className="text-xs px-2 py-0.5 bg-green-900/30 text-green-400 rounded-full font-medium">✓ Approved</span>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <StarDisplay rating={review.rating} />
                      <span className="text-gray-500 text-xs">{review.customers?.name || 'Anonymous'} · {formatDate(review.created_at)}</span>
                    </div>
                    {review.review_text && (
                      <p className="text-gray-300 text-sm italic line-clamp-2">"{review.review_text}"</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Request Review Tab */}
      {tab === 'request' && (
        <div className="max-w-lg">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-sm">
            <h2 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
              <Send size={18} className="text-forest-green" /> Request Review via Email
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-2">Select Order</label>
                <select
                  value={requestOrderId}
                  onChange={(e) => setRequestOrderId(e.target.value)}
                  className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:border-forest-green outline-none"
                >
                  <option value="">— Choose a delivered order —</option>
                  {data.deliveredOrders.map((o: any) => (
                    <option key={o.id} value={o.id}>
                      {o.customer_name} ({o.id.slice(0, 8)})
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleRequestReview}
                disabled={isPending || !requestOrderId}
                className="w-full py-3 bg-forest-green hover:bg-forest-green/90 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPending ? 'Sending…' : <><Send size={16} /> Send Review Request</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
