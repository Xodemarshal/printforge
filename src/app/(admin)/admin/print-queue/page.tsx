import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/Button";
import { updateIdeaRequestAction } from "@/actions/stl";
import { ClipboardList, Clock, CheckCircle, Flame, Layers } from "lucide-react";

const REQUEST_STATUS_CARDS = [
  { label: "Pending review", status: "pending_review", badgeColor: "bg-yellow-900/40 text-yellow-300 border-yellow-800/60" },
  { label: "Ready for concept", status: "approved", badgeColor: "bg-blue-900/40 text-blue-300 border-blue-800/60" },
  { label: "In production", status: "in_production", badgeColor: "bg-green-900/40 text-green-300 border-green-800/60" }
] as const;

function formatDate(value?: string | null) {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function PrintQueuePage() {
  const supabase = createAdminClient();
  const [{ data, count }, { count: pendingCount }, { count: todayCount }] = await Promise.all([
    supabase
      .from("stl_uploads")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("stl_uploads").select("*", { count: "exact", head: true }).eq("status", "pending_review"),
    supabase.from("stl_uploads").select("*", { count: "exact", head: true }).gte("created_at", `${new Date().toISOString().slice(0, 10)}T00:00:00Z`)
  ]);

  const requests = data ?? [];
  const statusCounts = Object.fromEntries(
    REQUEST_STATUS_CARDS.map(({ status }) => [
      status,
      requests.filter((request: any) => request.status === status).length
    ])
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-yellow-500/80 mb-1">PrintForge Admin</p>
        <h1 className="text-3xl font-bold text-white">Idea Requests & Print Queue</h1>
        <p className="text-gray-400 mt-1 text-sm">Review customer custom print requests, reference boards, and concept pipeline.</p>
      </div>

      {/* Status KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {REQUEST_STATUS_CARDS.map((card) => (
          <div key={card.status} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Pipeline Stage</p>
                <p className="mt-1 font-bold text-white text-lg">{card.label}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${card.badgeColor}`}>
                {statusCounts[card.status]} active
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-400">Submissions currently in this stage.</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Main Requests List */}
        <div className="space-y-4">
          {requests.map((request: any) => {
            const referenceImages = Array.isArray(request.reference_images)
              ? request.reference_images.filter((image: unknown): image is string => typeof image === "string" && image.length > 0)
              : [];

            return (
              <div key={request.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
                  <div className="overflow-hidden rounded-lg border border-gray-800 bg-black">
                    {referenceImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-1 p-1">
                        {referenceImages.slice(0, 4).map((image: string, index: number) => (
                          <img
                            key={image}
                            src={image}
                            alt={`Reference ${index + 1}`}
                            className="h-28 w-full rounded-md object-cover"
                          />
                        ))}
                      </div>
                    ) : request.file_url ? (
                      <img src={request.file_url} alt={request.file_name} className="h-full min-h-[160px] w-full object-cover" />
                    ) : (
                      <div className="grid min-h-[160px] place-items-center text-xs text-gray-500">
                        No reference image
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-mono text-gray-500">ID: #{request.id.slice(0, 8)}</p>
                        <p className="text-sm font-bold text-white mt-0.5">Handle: {request.instagram_handle || "N/A"}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-900/40 text-blue-300 border border-blue-800/60 capitalize">
                        {request.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="rounded-lg border border-gray-800 bg-black p-3.5">
                      <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Idea Brief</p>
                      <p className="mt-1 text-sm text-gray-300 leading-relaxed">{request.idea}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs text-gray-500 mr-1">Move stage:</span>
                      {[
                        ["pending_review", "Queue"],
                        ["reviewing", "Review"],
                        ["approved", "Approve"],
                        ["in_production", "Build"],
                        ["completed", "Complete"],
                        ["rejected", "Reject"]
                      ].map(([status, label]) => (
                        <form
                          key={label}
                          action={async (formData) => {
                            "use server";
                            await updateIdeaRequestAction(formData);
                          }}
                        >
                          <input type="hidden" name="id" value={request.id} />
                          <input type="hidden" name="status" value={status} />
                          <button 
                            type="submit" 
                            className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                              request.status === status 
                                ? 'bg-green-900/50 text-green-300 border-green-700' 
                                : 'bg-black text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
                            }`}
                          >
                            {label}
                          </button>
                        </form>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {requests.length === 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-500 text-sm">
              No custom idea requests found.
            </div>
          )}
        </div>

        {/* Sidebar Stats */}
        <aside className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-fit space-y-4">
          <h2 className="text-white font-semibold text-sm border-b border-gray-800 pb-3">Production Overview</h2>
          <div className="space-y-4">
            {[
              ["Requests today", todayCount ?? 0],
              ["Pending reviews", pendingCount ?? 0],
              ["Reference boards", requests.reduce((total: number, request: any) => total + (Array.isArray(request.reference_images) ? request.reference_images.length : 0), 0)],
              ["Queue size", requests.length]
            ].map(([label, value]) => (
              <div key={label as string}>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">{label as string}</span>
                  <span className="font-bold text-white">{value as number}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${Math.min(100, (value as number) * 10 || 10)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
