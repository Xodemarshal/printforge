import { Shield, Package, Globe, RotateCcw } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Shield, title: "Premium Quality", body: "Handcrafted with care" },
  { icon: Package, title: "Secure Packaging", body: "Safe & reliable" },
  { icon: Globe, title: "India Delivery", body: "Delivered across India" },
  { icon: RotateCcw, title: "Easy Returns", body: "10-day guarantee" }
];

export function TrustBar() {
  return (
    <section className="border-y border-white/10 bg-white/5 backdrop-blur-md py-10">
      <div className="page-shell grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_ITEMS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="group flex items-start gap-5 transition-all duration-300 hover:scale-[1.02]">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-black/30 shadow-xl border border-white/10 text-emerald-400 transition-all duration-500 group-hover:bg-emerald-600 group-hover:text-white group-hover:-rotate-3">
              <Icon size={24} />
            </span>
            <div className="space-y-1.5 pt-1">
              <p className="display-font text-lg font-bold text-emerald-400 tracking-tight">{title}</p>
              <p className="text-xs leading-relaxed text-cream/60 font-medium max-w-[180px]">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
