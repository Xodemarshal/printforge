"use client";

import { useState } from "react";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = [
    {
      question: "How do idea requests work?",
      answer:
        "Share your Instagram handle, a short idea brief, and a few reference images. We review the style cues and prepare a unique item concept for you."
    },
    {
      question: "Do you support custom colors?",
      answer:
        "Yes. Include your preferred colors or examples in the brief, and we'll match the palette as closely as possible when we build your item."
    }
  ];

  return (
    <section className="page-shell py-10 lg:py-14">
      <div className="mb-6 max-w-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-[#c5a059]/80">Support</p>
        <h2 className="display-font text-4xl text-[#c5a059] md:text-5xl">Frequently asked questions</h2>
        <p className="mt-3 text-sm leading-7 text-[#6d5a3a]">
          Need help before sending a request? Start here.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <button
              key={item.question}
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="wood-texture rounded-[24px] border border-[#8c6f42]/20 p-5 text-left text-[#f4ecd9] transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="font-semibold text-[#f4ecd9]">{item.question}</p>
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#c5a059]/20 bg-black/20 text-[#c5a059]">
                  {isOpen ? "−" : "+"}
                </span>
              </div>
              {isOpen ? <p className="mt-3 text-sm leading-7 text-[#e4d8c3]">{item.answer}</p> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
