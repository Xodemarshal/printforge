"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/guards";
import { revalidatePath } from "next/cache";

export interface FeaturedItem {
  img: string;
  label: string;
  tag: string;
}

export interface HeroSectionSettings {
  title: string;
  coloredTitle: string;
  subtitle: string;
  description: string;
  buttonText: string;
  imageUrl: string;
  showcaseTitle: string;
  showcaseItalic: string;
  featuredItems: FeaturedItem[];
}

export interface SiteSettings {
  siteName: string;
  logoUrl: string;
  hero: HeroSectionSettings;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Forest Foundry",
  logoUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=groot&backgroundColor=2c3e2d",
  hero: {
    title: "Ideas",
    coloredTitle: "Take Shape.",
    subtitle: "Premium Products",
    description: "Transform your ideas into stunning physical products with our premium design services and marketplace.",
    buttonText: "Explore Products",
    imageUrl: "https://picsum.photos/seed/wooden-guardian-hero/1400/1600",
    showcaseTitle: "Custom Product",
    showcaseItalic: "Design Made Easy",
    featuredItems: [
      { img: "https://picsum.photos/seed/wooden-guardian-collection-1/900/1200", label: "Fantasy Resin Mask", tag: "Classical Resin" },
      { img: "https://picsum.photos/seed/wooden-guardian-collection-2/900/1200", label: "Premium Rocin", tag: "Premium Finish" },
      { img: "https://picsum.photos/seed/wooden-guardian-collection-3/900/1200", label: "Custom Keyboard", tag: "Desk Collectible" },
      { img: "https://picsum.photos/seed/wooden-guardian-collection-4/900/1200", label: "Hand-carved Wood", tag: "Limited Series" }
    ]
  }
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createAdminClient();
    
    // FIXED: Removed .schema() and cast to any to clear compiler constraints
    const { data, error } = await (supabase as any)
      .from("settings")
      .select("*")
      .eq("key", "site_settings")
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_SETTINGS;
    }

    const value = data.value as any;
    return {
      siteName: value?.siteName || DEFAULT_SETTINGS.siteName,
      logoUrl: value?.logoUrl || DEFAULT_SETTINGS.logoUrl,
      hero: {
        title: value?.hero?.title || DEFAULT_SETTINGS.hero.title,
        coloredTitle: value?.hero?.coloredTitle || DEFAULT_SETTINGS.hero.coloredTitle,
        subtitle: value?.hero?.subtitle || DEFAULT_SETTINGS.hero.subtitle,
        description: value?.hero?.description || DEFAULT_SETTINGS.hero.description,
        buttonText: value?.hero?.buttonText || DEFAULT_SETTINGS.hero.buttonText,
        imageUrl: value?.hero?.imageUrl || DEFAULT_SETTINGS.hero.imageUrl,
        showcaseTitle: value?.hero?.showcaseTitle || DEFAULT_SETTINGS.hero.showcaseTitle,
        showcaseItalic: value?.hero?.showcaseItalic || DEFAULT_SETTINGS.hero.showcaseItalic,
        featuredItems: Array.isArray(value?.hero?.featuredItems) ? value.hero.featuredItems.map((item: any, idx: number) => ({
          img: item?.img || DEFAULT_SETTINGS.hero.featuredItems[idx]?.img || "",
          label: item?.label || DEFAULT_SETTINGS.hero.featuredItems[idx]?.label || "",
          tag: item?.tag || DEFAULT_SETTINGS.hero.featuredItems[idx]?.tag || "",
        })) : DEFAULT_SETTINGS.hero.featuredItems
      }
    };
  } catch (err) {
    console.error("Failed to load settings from Supabase:", err);
    return DEFAULT_SETTINGS;
  }
}

async function uploadSettingsImage(file: File | null, prefix: string) {
  if (!file || file.size === 0) {
    return null;
  }

  try {
    const supabase = createAdminClient();
    const path = `settings/${prefix}-${Date.now()}-${file.name}`;
    
    // FIXED: Added any assertion to bypass mock object properties
    const { error } = await (supabase as any)
      .storage
      .from("product-images")
      .upload(path, file, {
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.warn(`Settings image upload failed: ${error.message}`);
      return null;
    }

    const { data } = (supabase as any).storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.warn(`Settings image upload error: ${error instanceof Error ? error.message : "Unknown error"}`);
    return null;
  }
}

export async function updateSiteSettingsAction(formData: FormData) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const current = await getSiteSettings();

    const logoFile = formData.get("logoFile") as File | null;
    const heroFile = formData.get("heroFile") as File | null;

    let logoUrl = current.logoUrl;
    let heroImageUrl = current.hero.imageUrl;

    if (logoFile && logoFile.size > 0) {
      const uploadedLogo = await uploadSettingsImage(logoFile, "logo");
      if (uploadedLogo) logoUrl = uploadedLogo;
    }

    if (heroFile && heroFile.size > 0) {
      const uploadedHero = await uploadSettingsImage(heroFile, "hero");
      if (uploadedHero) heroImageUrl = uploadedHero;
    }

    const featuredItems = [];
    for (let i = 0; i < 4; i++) {
      const label = String(formData.get(`item${i}Label`) || current.hero.featuredItems[i]?.label || "").trim();
      const tag = String(formData.get(`item${i}Tag`) || current.hero.featuredItems[i]?.tag || "").trim();
      
      const file = formData.get(`item${i}File`) as File | null;
      let img = current.hero.featuredItems[i]?.img || DEFAULT_SETTINGS.hero.featuredItems[i].img;
      if (file && file.size > 0) {
        const uploadedImg = await uploadSettingsImage(file, `featured-${i}`);
        if (uploadedImg) img = uploadedImg;
      }
      featuredItems.push({ img, label, tag });
    }

    const value = {
      siteName: String(formData.get("siteName") || current.siteName).trim(),
      logoUrl,
      hero: {
        title: String(formData.get("heroTitle") || current.hero.title).trim(),
        coloredTitle: String(formData.get("heroColoredTitle") || current.hero.coloredTitle).trim(),
        subtitle: String(formData.get("heroSubtitle") || current.hero.subtitle).trim(),
        description: String(formData.get("heroDescription") || current.hero.description).trim(),
        buttonText: String(formData.get("heroButtonText") || current.hero.buttonText).trim(),
        imageUrl: heroImageUrl,
        showcaseTitle: String(formData.get("heroShowcaseTitle") || current.hero.showcaseTitle).trim(),
        showcaseItalic: String(formData.get("heroShowcaseItalic") || current.hero.showcaseItalic).trim(),
        featuredItems
      }
    };

    // FIXED: Removed .schema() and left { onConflict: 'key' } safely behind an any cast
    const { error } = await (supabase as any)
      .from("settings")
      .upsert(
        {
          key: "site_settings",
          value,
          updated_at: new Date().toISOString()
        },
        { 
          onConflict: 'key'
        }
      );

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/admin/settings");
    
    return { success: true, message: "Settings updated successfully" };
  } catch (err: any) {
    console.error("Update settings action error:", err);
    return { error: err.message || "Failed to update settings" };
  }
}
