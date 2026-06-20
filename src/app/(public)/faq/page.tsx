import type { Metadata } from "next";
import { FAQSection } from "@/components/home/FAQSection";

export const metadata: Metadata = {
  title: "FAQ | PrintForge",
  description: "Frequently asked questions about PrintForge."
};

export default function FaqPage() {
  return (
    <div className="page-shell py-10 lg:py-14">
      <div className="mb-8 rounded-[34px] border border-[#8c6f42]/20 bg-[#243223] p-8 text-[#f4ecd9] shadow-[0_24px_60px_rgba(36,50,35,0.22)]">
        <p className="text-sm uppercase tracking-[0.3em] text-[#c5a059]/80">Support</p>
        <h1 className="display-font mt-3 text-4xl text-[#c5a059] md:text-5xl">Frequently asked questions</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#e4d8c3]">
          Need help before sending a request? We keep the most common answers here so you can move forward with confidence.
        </p>
      </div>

      <FAQSection />

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="wood-texture rounded-[28px] border border-[#8c6f42]/20 p-6 text-[#f4ecd9]">
          <p className="text-xs uppercase tracking-[0.3em] text-[#c5a059]/80">Need more help?</p>
          <h2 className="display-font mt-2 text-2xl">Reach support</h2>
          <p className="mt-3 text-sm leading-7 text-[#e4d8c3]">
            Email us if you want help shaping your idea before you submit the brief.
          </p>
        </div>
        <div className="wood-texture rounded-[28px] border border-[#8c6f42]/20 p-6 text-[#f4ecd9]">
          <p className="text-xs uppercase tracking-[0.3em] text-[#c5a059]/80">Response time</p>
          <h2 className="display-font mt-2 text-2xl">Usually within 1 business day</h2>
          <p className="mt-3 text-sm leading-7 text-[#e4d8c3]">
            We review each request manually and reply with the next step once the concept direction is clear.
          </p>
        </div>
      </div>
    </div>
  );
}
