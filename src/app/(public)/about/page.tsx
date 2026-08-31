import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Crafted Tale",
  description: "Learn the story behind Crafted Tale, the makers behind it, and how we turn ideas into meaningful everyday pieces."
};

export default function AboutPage() {
  return (
    <div className="bg-gradient-to-b from-background via-accent/10 to-background">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <section className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_20px_80px_-40px_rgba(0,0,0,0.35)]">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative p-8 sm:p-10 lg:p-12">
              <div className="mb-6 inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                About Crafted Tale
              </div>
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Crafted with intention. Designed to feel personal.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Crafted Tale started with a simple idea: ordinary objects can be made a little more personal,
                creative, and meaningful.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                We&apos;re Satyam and Sumit, two makers who enjoy turning ideas into things you can actually hold.
                What began with experimenting, designing, and 3D printing has grown into Crafted Tale, a place where
                we create unique pieces designed to add character to your space, your gifts, and everyday life.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">What we make</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Thoughtful pieces that feel useful, expressive, and easy to connect with.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">How we work</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    From digital design to final print, we keep the process hands-on.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Why it matters</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    We believe everyday items should carry a little more story, joy, and character.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative flex items-center bg-[radial-gradient(circle_at_top,_rgba(128,180,76,0.22),_transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-8 sm:p-10 lg:p-12">
              <div className="w-full rounded-3xl border border-white/10 bg-background/80 p-6 shadow-2xl shadow-black/10 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Our promise</p>
                <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                  Every piece has a tale behind it.
                </p>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  We focus on making things ourselves, experimenting with new ideas, and keeping our products
                  accessible without losing the joy of craftsmanship.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="rounded-2xl border border-border/70 bg-card p-4">
                    <p className="text-sm font-medium text-foreground">Experiment first</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      We test, refine, and keep learning until the idea feels right.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-card p-4">
                    <p className="text-sm font-medium text-foreground">Make it tangible</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Digital sketches become real objects you can use, gift, and keep.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-card p-4">
                    <p className="text-sm font-medium text-foreground">Keep it meaningful</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      We aim for pieces that feel personal, not mass-produced.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border/60 bg-card p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Our journey</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">From first idea to final print</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              What started as experimentation with design and 3D printing grew into a brand built around creativity,
              craftsmanship, and accessible products that still feel special.
            </p>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Our vision</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Small details, bigger meaning</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              We want Crafted Tale to be a place where thoughtful objects bring a little more character into
              everyday life and turn simple moments into memorable ones.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-border/60 bg-primary/5 px-8 py-10 sm:px-10">
          <p className="text-sm font-medium text-primary">Closing note</p>
          <p className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            We&apos;re here to craft pieces that feel like they belong to your story.
          </p>
        </section>
      </div>
    </div>
  );
}
