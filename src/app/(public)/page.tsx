import type { Metadata } from "next";
import { HeroBanner } from "@/components/home/HeroBanner";
import { TrustBar } from "@/components/home/TrustBar";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BestSellers } from "@/components/home/BestSellers";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { CustomerReviews } from "@/components/home/CustomerReviews";
import { FAQSection } from "@/components/home/FAQSection";
import { getBestSellers, getFeaturedProducts } from "@/actions/products";
import { createAdminClient } from "@/lib/supabase/admin";
import { mockData } from "@/lib/mock-supabase";

export const metadata: Metadata = {
  title: "Wooden Guardian",
  description: "Creative collectibles and product showcase."
};

export default async function HomePage() {
  const featured = await getFeaturedProducts();
  const bestSellers = await getBestSellers();
  const supabase = createAdminClient();
  const categoriesResult = await supabase.from("categories").select("*").limit(8);
  const reviewsResult = await supabase.from("reviews").select("id, comment, user_id").limit(3);
  const categories = categoriesResult.error ? mockData.categories : categoriesResult.data;
  const reviews = reviewsResult.error ? mockData.reviews : reviewsResult.data;

  return (
    <>
      <HeroBanner />
      <TrustBar />
      <FeaturedProducts products={featured} />
      <BestSellers products={bestSellers} />
      <TrendingProducts products={featured} />
      <CategoryGrid categories={categories ?? []} />
      <CustomerReviews
        reviews={(reviews ?? []).map((review: any) => ({
          id: review.id,
          comment: review.comment ?? "",
          name: review.user_id ?? "Customer"
        }))}
      />
      <FAQSection />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Wooden Guardian"
          })
        }}
      />
    </>
  );
}
