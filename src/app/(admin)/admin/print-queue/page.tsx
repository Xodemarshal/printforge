import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { updateIdeaRequestAction } from "@/actions/stl";

const REQUEST_STATUS_CARDS = [
  { label: "Pending review", status: "pending_review", accent: "bg-[#243a2b] text-[#e9dfcc]" },
  { label: "Ready for concept", status: "approved", accent: "bg-[#3b3225] text-[#f2d7a0]" },
  { label: "In production", status: "in_production", accent: "bg-[#2d4f36] text-[#76c893]" }
] as const;

function formatDate(value?: string | null) {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat("en-US", {
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
      <div className="panel-dark rounded-[34px] p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-[#c8b99d]">Request queue</p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <h1 className="display-font text-5xl leading-[0.95] text-[#f4ecd9]">Idea requests</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#c9bea8]">
              Review the handle, idea brief, and inspiration images. Move each request through the concept pipeline.
            </p>
          </div>
          <Badge className="bg-[#243a2b] text-[#e9dfcc]" tone="secondary">
            {count ?? requests.length} active
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {REQUEST_STATUS_CARDS.map((card) => (
          <div key={card.status} className="panel-dark rounded-[28px] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#c8b99d]">Request status</p>
                <p className="mt-1 font-semibold text-[#f4ecd9]">{card.label}</p>
              </div>
              <Badge className={card.accent} tone="secondary">
                {statusCounts[card.status]}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-[#c9bea8]">Live submissions waiting in this stage.</p>
            <div className="mt-4 h-16 rounded-2xl border border-white/8 bg-[#101a14] p-2">
              <div className="flex h-full items-end gap-1">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-[#76c893]/60"
                    style={{ height: `${35 + ((i * 17) % 50)}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {requests.map((request: any) => {
            const referenceImages = Array.isArray(request.reference_images)
              ? request.reference_images.filter((image: unknown): image is string => typeof image === "string" && image.length > 0)
              : [];

            return (
              <div key={request.id} className="panel-dark rounded-[32px] p-4">
                <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
                  <div className="overflow-hidden rounded-[28px] border border-white/8 bg-white/5">
                    {referenceImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-1 p-2">
                        {referenceImages.slice(0, 4).map((image: string, index: number) => (
                          <img
                            key={image}
                            src={image}
                            alt={`Reference ${index + 1}`}
                            className="h-40 w-full rounded-[18px] object-cover"
                          />
                        ))}
                      </div>
                    ) : request.file_url ? (
                      <img src={request.file_url} alt={request.file_name} className="h-full min-h-[220px] w-full object-cover" />
                    ) : (
                      <div className="grid min-h-[220px] place-items-center text-sm text-[#c9bea8]">
                        No preview available
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-[#c8b99d]">Request</p>
                        <p className="font-medium text-[#f4ecd9]">{request.id}</p>
                      </div>
                      <Badge className="bg-[#243a2b] text-[#e9dfcc]" tone="secondary">
                        {request.status}
                      </Badge>
                    </div>

                    <div className="grid gap-2 text-sm text-[#c9bea8] sm:grid-cols-2">
                      <p>
                        <span className="text-[#a89880]">Instagram</span>
                        <br />
                        {request.instagram_handle || "N/A"}
                      </p>
                      <p>
                        <span className="text-[#a89880]">Submitted</span>
                        <br />
                        {formatDate(request.created_at)}
                      </p>
                    </div>

                    <div className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#c8b99d]">Idea brief</p>
                      <p className="mt-2 text-sm leading-6 text-[#e1d6c1]">{request.idea}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <form
                        action={async (formData) => {
                          "use server";
                          await updateIdeaRequestAction(formData);
                        }}
                        className="flex flex-wrap gap-2"
                      >
                        <input type="hidden" name="id" value={request.id} />
                        <input
                          name="status"
                          placeholder="Status"
                          defaultValue={request.status}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#f4ecd9]"
                        />
                        <Button type="submit" variant="gold" className="rounded-full">
                          Update
                        </Button>
                      </form>
                    </div>

                    <div className="flex flex-wrap gap-2">
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
                          <Button type="submit" variant="outline" className="rounded-full border-white/10 bg-white/5 text-[#f4ecd9]">
                            {label}
                          </Button>
                        </form>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="panel-dark h-fit rounded-[28px] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[#c8b99d]">Production statistics</p>
          <div className="mt-4 space-y-4">
            {[
              ["Requests today", todayCount ?? 0],
              ["Pending reviews", pendingCount ?? 0],
              ["Reference boards", requests.reduce((total: number, request: any) => total + (Array.isArray(request.reference_images) ? request.reference_images.length : 0), 0)],
              ["Queue size", requests.length]
            ].map(([label, value]) => (
              <div key={label as string}>
                <div className="flex justify-between text-sm">
                  <span className="text-[#c9bea8]">{label as string}</span>
                  <span className="font-semibold text-[#f4ecd9]">{value as number}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[#76c893]"
                    style={{ width: `${Math.min(100, (value as number) * 10 || 12)}%` }}
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
