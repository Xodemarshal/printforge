import { Shield, Package, Globe, RotateCcw } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Shield, title: "Premium Quality", body: "Handcrafted with care" },
  { icon: Package, title: "Secure Packaging", body: "Safe & reliable" },
  { icon: Globe, title: "India Delivery", body: "Delivered across India" },
  { icon: RotateCcw, title: "Easy Returns", body: "10-day guarantee" }
];

export function TrustBar() {
  return (
    <section className="border-y border-accent/10 bg-[#f7eddc]/20 backdrop-blur-md py-10">
      <div className="page-shell grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_ITEMS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="group flex items-start gap-5 transition-all duration-300 hover:scale-[1.02]">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white shadow-xl shadow-accent/5 border border-accent/10 text-accent transition-all duration-500 group-hover:bg-accent group-hover:text-white group-hover:-rotate-3">
              <Icon size={24} />
            </span>
            <div className="space-y-1.5 pt-1">
              <p className="display-font text-lg font-bold text-forest tracking-tight">{title}</p>
              <p className="text-xs leading-relaxed text-forest/60 font-medium max-w-[180px]">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
