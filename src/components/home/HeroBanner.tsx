import Link from "next/link";
import { DESIGN_IMAGES } from "@/lib/design";
import type { HeroSectionSettings } from "@/actions/settings";

type CategoryItem = {
  id: string;
  slug: string;
  name: string;
  image_url?: string;
};

export function HeroBanner({ settings, categories = [] }: { settings?: HeroSectionSettings; categories?: CategoryItem[] }) {
  const title = settings?.title || "Ideas";
  const coloredTitle = settings?.coloredTitle || "Take Shape.";
  const subtitle = settings?.subtitle || "Premium Products";
  const description = settings?.description || "Transform your ideas into stunning physical products with our premium design services and marketplace.";
  const buttonText = settings?.buttonText || "Explore Products";
  const imageUrl = settings?.imageUrl || DESIGN_IMAGES.heroCharacter;
  const showcaseTitle = settings?.showcaseTitle || "Custom Product";
  const showcaseItalic = settings?.showcaseItalic || "Design Made Easy";

  // Use real categories with images for the collection grid (max 4)
  const displayCategories = categories
    .filter((cat) => cat.image_url)
    .slice(0, 4);

  return (
    <section className="relative overflow-hidden pt-6 pb-12 lg:pt-10 lg:pb-20">
      <div className="page-shell">
        <div className="panel-premium rounded-[48px] p-3 lg:p-4 flex flex-col gap-2">

          {/* Top row: Main photo + Categories */}
          <div className={`grid grid-cols-1 gap-4 ${displayCategories.length > 0 ? "lg:grid-cols-[1.6fr_1.2fr]" : ""}`}>

            {/* Main Showcase */}
            <div className="group relative min-h-[340px] overflow-hidden rounded-[40px] bg-cream lg:min-h-[460px]">
              <img
                src={imageUrl}
                alt="ArchiveVault product showcase"
                className="h-full w-full object-contain transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 right-10">
                <div className="flex items-center gap-3">
                  <span className="h-px w-10 bg-primary" />
                  <span className="label-font">Product Showcase</span>
                </div>
                <h2 className="display-font mt-3 text-3xl text-on-dark leading-tight lg:text-4xl font-bold">
                  {showcaseTitle} <br />
                  <span className="text-accent-warm italic">{showcaseItalic}</span>
                </h2>
              </div>
            </div>

            {/* Collection Grid — Real Categories */}
            {displayCategories.length > 0 && (
              <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
                {displayCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="card-artisan group w-full h-full min-h-[150px] lg:min-h-[215px]"
                  >
                    <div className="absolute inset-0">
                      <img
                        src={category.image_url!}
                        alt={category.name}
                        className="h-full w-full object-cover object-center opacity-80 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </div>
                    <div className="absolute inset-2 rounded-2xl border border-white/20 pointer-events-none" />
                    <div className="absolute bottom-5 left-5 right-5">
                      <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-accent-warm">Shop Category</p>
                      <p className="display-font mt-1.5 text-lg text-on-dark font-semibold leading-tight line-clamp-1">{category.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Bottom panel: stacked — badge → headline → description → CTA + stats */}
          <div className="rounded-[40px] panel-alabaster px-10 py-10 lg:px-16 lg:py-12">
            <div className="flex flex-col gap-5">
              {/* Badge */}
              <span className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {subtitle}
              </span>

              {/* Headline */}
              <h1 className="display-font text-5xl leading-[0.9] text-emerald-300 lg:text-6xl font-bold">
                {coloredTitle}
              </h1>

              {/* Description */}
              <p className="text-lg text-white font-medium leading-relaxed w-full">
                {description}
              </p>
            </div>

            {/* CTA + stats row */}
            <div className="mt-8 flex flex-wrap items-center gap-8 pt-8 border-t border-white/10">
              <Link href="/shop" className="btn-artisan-forest text-center text-sm whitespace-nowrap">
                {buttonText}
              </Link>
              <div className="flex gap-8 ml-auto">
                <div className="space-y-0.5">
                  <p className="display-font text-2xl font-bold text-emerald-400">{settings?.stats?.productsCount || "2.5k+"}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-cream/50">{settings?.stats?.productsLabel || "Products Created"}</p>
                </div>
                <div className="space-y-0.5 border-l border-white/10 pl-8">
                  <p className="display-font text-2xl font-bold text-emerald-400">{settings?.stats?.rating || "4.9/5"}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-cream/50">{settings?.stats?.ratingLabel || "Customer Rating"}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
