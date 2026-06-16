import Link from "next/link";
import { DESIGN_IMAGES } from "@/lib/design";

export function UploadCTA() {
  return (
    <section className="page-shell py-10 lg:py-14">
      <div className="panel-soft overflow-hidden rounded-[32px] p-4 lg:p-6">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-black/10 bg-[#f4ead8] p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-foreground/50">Upload experience</p>
            <h2 className="display-font mt-4 max-w-xl text-4xl text-[#243223]">Upload your design and get an instant quote</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-foreground/70">
              Drag in your STL, OBJ, or 3MF file and configure materials, finish, and quantity just like the reference layout.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/upload-design" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                Upload design
              </Link>
              <Link href="/checkout" className="rounded-full border border-black/10 bg-white/70 px-5 py-3 text-sm font-semibold">
                View cart
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Upload File", "Review Model", "Place Order"].map((step, index) => (
                <div key={step} className="rounded-2xl border border-black/10 bg-white/70 p-4 text-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-foreground/45">Step {index + 1}</p>
                  <p className="mt-2 font-medium">{step}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <div className="rounded-[28px] border border-black/10 bg-white/70 p-3 shadow-lg">
              <img src={DESIGN_IMAGES.uploadHero} alt="Upload preview" className="h-full w-full rounded-[22px] object-cover" />
            </div>
            <div className="rounded-[28px] border border-black/10 bg-[#fffaf1] p-5 shadow-lg">
              <p className="text-sm uppercase tracking-[0.3em] text-foreground/45">Quote panel</p>
              <div className="mt-4 space-y-3">
                {[
                  ["Material", "Bronze"],
                  ["Color", "Matte Black Resin"],
                  ["Layer height", "0.1 mm"],
                  ["Infill", "20%"]
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm">
                    <span className="text-foreground/60">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-primary px-4 py-4 text-primary-foreground">
                <p className="text-xs uppercase tracking-[0.3em] text-primary-foreground/70">Instant quote</p>
                <p className="mt-2 text-3xl font-semibold">$23.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
