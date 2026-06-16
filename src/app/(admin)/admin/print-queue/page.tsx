import { createAdminClient } from "@/lib/supabase/admin";
import { STLViewer } from "@/components/stl/STLViewer";
import { Button } from "@/components/ui/Button";
import { updatePrintJobAction } from "@/actions/orders";
import { Badge } from "@/components/ui/Badge";

const PRODUCTION_SLOTS = [
  { id: "Station 1", material: "Premium", progress: 72, eta: "2h 15m" },
  { id: "Station 2", material: "Standard", progress: 45, eta: "4h 30m" },
  { id: "Station 3", material: "Premium", progress: 91, eta: "45m" }
];

export default async function PrintQueuePage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("print_jobs").select("*, stl_uploads(*)").limit(50);

  return (
    <div className="space-y-6">
      <div className="panel-dark rounded-[34px] p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-[#c8b99d]">Order queue</p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <h1 className="display-font text-5xl leading-[0.95] text-[#f4ecd9]">Production jobs</h1>
          <Badge className="bg-[#243a2b] text-[#e9dfcc]" tone="secondary">
            {data?.length ?? 0} active
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {PRODUCTION_SLOTS.map((station) => (
          <div key={station.id} className="panel-dark rounded-[28px] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#c8b99d]">Production Station</p>
                <p className="mt-1 font-semibold text-[#f4ecd9]">{station.id}</p>
              </div>
              <Badge className="bg-[#2d4f36] text-[#76c893]" tone="secondary">
                Processing
              </Badge>
            </div>
            <p className="mt-3 text-sm text-[#c9bea8]">{station.material}</p>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-[#a89880]">
                <span>Progress</span>
                <span>ETA {station.eta}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2d4f36] to-[#76c893]"
                  style={{ width: `${station.progress}%` }}
                />
              </div>
            </div>
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
          {(data ?? []).map((job: any) => (
            <div key={job.id} className="panel-dark rounded-[32px] p-4">
              <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
                <div className="overflow-hidden rounded-[28px] border border-white/8 bg-white/5">
                  {job.stl_uploads?.file_url ? (
                    <STLViewer url={job.stl_uploads.file_url} filename={job.stl_uploads.file_name} />
                  ) : null}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-[#c8b99d]">Job</p>
                      <p className="font-medium text-[#f4ecd9]">{job.id}</p>
                    </div>
                    <Badge className="bg-[#243a2b] text-[#e9dfcc]" tone="secondary">
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#c9bea8]">
                    {job.material} / {job.color}
                  </p>
                  <form 
                    action={async (formData) => {
                      "use server";
                      await updatePrintJobAction(formData);
                    }} 
                    className="flex flex-wrap gap-2"
                  >
                    <input type="hidden" name="id" value={job.id} />
                    <input
                      name="status"
                      placeholder="Status"
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#f4ecd9]"
                    />
                    <input
                      name="assigned_station"
                      placeholder="Station"
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#f4ecd9]"
                    />
                    <Button type="submit" variant="gold" className="rounded-full">
                      Update
                    </Button>
                  </form>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ["processing", "Start Work"],
                      ["paused", "Pause"],
                      ["processing", "Resume"],
                      ["completed", "Complete"],
                      ["rejected", "Reject"]
                    ].map(([status, label]) => (
                      <form 
                        key={label} 
                        action={async (formData) => {
                          "use server";
                          await updatePrintJobAction(formData);
                        }}
                      >
                        <input type="hidden" name="id" value={job.id} />
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
          ))}
        </div>

        <aside className="panel-dark h-fit rounded-[28px] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[#c8b99d]">Production statistics</p>
          <div className="mt-4 space-y-4">
            {[
              ["Material usage", 52],
              ["Quality metrics", 35],
              ["Total production", 380],
              ["Order completion", 373]
            ].map(([label, value]) => (
              <div key={label as string}>
                <div className="flex justify-between text-sm">
                  <span className="text-[#c9bea8]">{label as string}</span>
                  <span className="font-semibold text-[#f4ecd9]">{value as number}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[#76c893]"
                    style={{ width: `${Math.min(100, value as number)}%` }}
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
