import type { Metadata } from "next";
import { DESIGN_IMAGES } from "@/lib/design";
import { IdeaRequestForm } from "./IdeaRequestForm";

export const metadata: Metadata = {
  title: "Special Item Request | Wooden Guardian",
  description: "Share your Instagram handle, idea brief, and inspiration images so we can design a unique item for you."
};

const INSPIRATION_POINTS = [
  "Your Instagram handle so we can read your style profile.",
  "A short brief describing the item or mood you want.",
  "Multiple reference images of things, textures, shapes, or products you like."
];

const PROCESS_STEPS = [
  {
    title: "We read your profile",
    body: "Our team looks at the handle, the idea brief, and the visual cues you share."
  },
  {
    title: "We sketch a unique concept",
    body: "The references become the starting point for something custom, not a copied template."
  },
  {
    title: "We prepare the item",
    body: "Once the direction is clear, we turn it into a production-ready unique piece."
  }
];

export default function UploadStlPage() {
  return (
    <div className="page-shell py-8 lg:py-10">
      <div className="mb-6 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-forest/50">Special request</p>
        <h1 className="display-font mt-2 text-4xl text-forest md:text-5xl">
          A special item for you
        </h1>
        <p className="mt-4 text-base leading-7 text-forest/70">
          Share your Instagram handle, your idea, and a few images of the things you like.
          Our team will use that profile to prepare a unique item made for you.
        </p>
      </div>

      <div className="panel-soft rounded-[34px] p-4 lg:p-6">
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="wood-texture flex flex-col rounded-[28px] border border-[#8c6f42]/20 p-6 text-[#f4ecd9]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#c5a059]/80">Step 1</p>
            <h2 className="display-font mt-2 text-2xl">Special item for you</h2>
            <p className="mt-2 text-sm text-[#d9cfbf]">
              Tell us who you are, what you want, and what shapes your taste.
            </p>

            <IdeaRequestForm />
          </div>

          <div className="wood-texture flex flex-col rounded-[28px] border border-[#8c6f42]/20 p-5 text-[#f4ecd9]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#c5a059]/80">Step 2</p>
            <h2 className="display-font mt-2 text-2xl">What to upload</h2>
            <p className="mt-3 text-sm leading-6 text-[#d9cfbf]">
              We work best when the brief is specific and visual. Use a few different references so we can
              understand the shape of the final piece.
            </p>

            <div className="mt-4 overflow-hidden rounded-[24px] border border-[#c5a059]/20 bg-black/20 p-3">
              <img src={DESIGN_IMAGES.uploadHero} alt="Idea preview board" className="h-72 w-full rounded-[18px] object-cover lg:h-80" />
            </div>

            <div className="mt-4 space-y-3">
              {INSPIRATION_POINTS.map((point, index) => (
                <div key={point} className="flex gap-3 rounded-2xl border border-[#c5a059]/20 bg-black/20 px-4 py-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#c5a059]/20 text-sm font-semibold text-[#f4ecd9]">
                    0{index + 1}
                  </span>
                  <p className="text-sm leading-6 text-[#e4d8c3]">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="wood-texture flex flex-col rounded-[28px] border border-[#8c6f42]/20 p-5 text-[#f4ecd9]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#c5a059]/80">Step 3</p>
            <h2 className="display-font mt-2 text-2xl">How we use it</h2>
            <div className="mt-4 space-y-3">
              {PROCESS_STEPS.map((step, index) => (
                <div key={step.title} className="rounded-[22px] border border-[#c5a059]/20 bg-black/20 p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#c5a059]/20 text-sm font-semibold text-[#f4ecd9]">
                      {index + 1}
                    </span>
                    <p className="font-semibold text-[#f4ecd9]">{step.title}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#d9cfbf]">{step.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[22px] border border-[#c5a059]/20 bg-black/20 p-4 text-[#f4ecd9]">
              <p className="text-xs uppercase tracking-[0.24em] text-[#c5a059]/80">What you get</p>
              <p className="mt-2 text-sm leading-6 text-[#e7dcc7]">
                A unique item direction tailored to the profile you share, with inspiration translated into a real product concept.
              </p>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#c5a059]/20 bg-black/20 px-4 py-3 text-sm">
                <p className="font-medium text-[#f4ecd9]">Profile-driven</p>
                <p className="text-xs text-[#d9cfbf]">Designed around your taste</p>
              </div>
              <div className="rounded-2xl border border-[#c5a059]/20 bg-black/20 px-4 py-3 text-sm">
                <p className="font-medium text-[#f4ecd9]">Reference-based</p>
                <p className="text-xs text-[#d9cfbf]">Images guide the final look</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
