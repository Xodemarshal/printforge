"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSettingsAction } from "@/actions/settings";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import type { SiteSettings } from "@/actions/settings";
import { Image as ImageIcon, Sparkles, UploadCloud, Truck, Package } from "lucide-react";

interface SettingsFormProps {
  initialSettings: SiteSettings;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [shippingMode, setShippingMode] = useState<"AUTOMATIC" | "MANUAL">(initialSettings.shippingMode || "AUTOMATIC");
  const { success, error } = useToast();
  const router = useRouter();

  // Dynamic preview states for images

  // Dynamic preview states for images
  const [logoPreview, setLogoPreview] = useState<string>(initialSettings.logoUrl);
  const [faviconPreview, setFaviconPreview] = useState<string>(initialSettings.faviconUrl || initialSettings.logoUrl);
  const [heroPreview, setHeroPreview] = useState<string>(initialSettings.hero.imageUrl);
  const [featuredPreviews, setFeaturedPreviews] = useState<string[]>([
    initialSettings.hero.featuredItems?.[0]?.img || "https://picsum.photos/seed/wooden-guardian-collection-1/900/1200",
    initialSettings.hero.featuredItems?.[1]?.img || "https://picsum.photos/seed/wooden-guardian-collection-2/900/1200",
    initialSettings.hero.featuredItems?.[2]?.img || "https://picsum.photos/seed/wooden-guardian-collection-3/900/1200",
    initialSettings.hero.featuredItems?.[3]?.img || "https://picsum.photos/seed/wooden-guardian-collection-4/900/1200"
  ]);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  }

  function handleFaviconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFaviconPreview(URL.createObjectURL(file));
    }
  }

  function handleHeroChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setHeroPreview(URL.createObjectURL(file));
    }
  }

  function handleFeaturedChange(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const newPreviews = [...featuredPreviews];
      newPreviews[idx] = URL.createObjectURL(file);
      setFeaturedPreviews(newPreviews);
    }
  }

  async function clientAction(formData: FormData) {
    setIsLoading(true);
    try {
      // Update shipping mode along with other settings
      const shippingModeInput = formData.get("shipping_mode") as "AUTOMATIC" | "MANUAL";
      if (shippingModeInput && shippingModeInput !== shippingMode) {
        setShippingMode(shippingModeInput);
      }

      // Update site settings (includes shipping mode in the JSON)
      const result = await updateSiteSettingsAction(formData);
      if (result && result.error) {
        error("Update Failed", result.error);
      } else if (result && result.success) {
        success("Settings Updated", result.message || "Settings updated successfully");
        router.refresh();
      }
    } catch (err) {
      console.error("Error updating settings:", err);
      error("Update Failed", err instanceof Error ? err.message : "Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form action={clientAction} className="space-y-8 max-w-5xl pb-16">
      {/* General Settings Card */}
      <Card className="bg-[#121212] border-gray-800 shadow-xl">
        <CardHeader className="border-gray-800">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Sparkles className="text-accent-warm h-5 w-5" /> Store Branding
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Configure your storefront general branding properties such as the store name and logo.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Site Name</label>
              <Input
                name="siteName"
                defaultValue={initialSettings.siteName}
                placeholder="e.g. PrintForge"
                className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-forest"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Logo Image</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl bg-gray-900 border border-gray-700 overflow-hidden flex items-center justify-center shrink-0">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-gray-600 h-8 w-8" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      name="logoFile"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="bg-black border-gray-700 text-white file:bg-gray-800 file:border-gray-600 file:text-gray-300 text-xs"
                    />
                    <p className="text-xs text-gray-500">
                      Main logo for site header and branding. Falls back to /design/logo.png if not set.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Favicon / Tab Icon</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl bg-gray-900 border border-gray-700 overflow-hidden flex items-center justify-center shrink-0">
                    {faviconPreview ? (
                      <img src={faviconPreview} alt="Favicon preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-gray-600 h-8 w-8" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      name="faviconFile"
                      type="file"
                      accept="image/*"
                      onChange={handleFaviconChange}
                      className="bg-black border-gray-700 text-white file:bg-gray-800 file:border-gray-600 file:text-gray-300 text-xs"
                    />
                    <p className="text-xs text-gray-500">
                      Small icon shown in browser tabs (uses logo if not set). Falls back to /design/logo.png.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Configuration Card */}
      <Card className="bg-[#121212] border-gray-800 shadow-xl">
        <CardHeader className="border-gray-800">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Truck className="text-accent-warm h-5 w-5" /> Shipping Configuration
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Configure global shipping settings for all orders in your store.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-300">Shipping Mode</label>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="radio"
                      id="shipping-automatic"
                      name="shipping_mode"
                      value="AUTOMATIC"
                      checked={shippingMode === "AUTOMATIC"}
                      onChange={() => setShippingMode("AUTOMATIC")}
                      className="peer hidden"
                    />
                    <label
                      htmlFor="shipping-automatic"
                      className="block p-4 rounded-xl border-2 border-gray-700 bg-gray-900 hover:border-forest transition-colors cursor-pointer peer-checked:border-forest peer-checked:bg-forest/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full border-2 border-gray-600 peer-checked:border-forest peer-checked:bg-forest"></div>
                        <div>
                          <p className="font-semibold text-white">Automatic (Shiprocket)</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Automated shipping via Shiprocket API. Generates AWBs, labels, and handles tracking automatically.
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="radio"
                      id="shipping-manual"
                      name="shipping_mode"
                      value="MANUAL"
                      checked={shippingMode === "MANUAL"}
                      onChange={() => setShippingMode("MANUAL")}
                      className="peer hidden"
                    />
                    <label
                      htmlFor="shipping-manual"
                      className="block p-4 rounded-xl border-2 border-gray-700 bg-gray-900 hover:border-forest transition-colors cursor-pointer peer-checked:border-forest peer-checked:bg-forest/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full border-2 border-gray-600 peer-checked:border-forest peer-checked:bg-forest"></div>
                        <div>
                          <p className="font-semibold text-white">Manual Shipping</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Manually manage shipping (India Post, DTDC, Delhivery, etc.). Admin controls all shipment updates.
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-xl border border-gray-800 bg-black/40">
              <p className="text-sm text-gray-400">
                <strong className="text-yellow-400">Important:</strong> Changing the shipping mode only affects new shipment operations. 
                Existing orders with Shiprocket shipments will continue to use Shiprocket tracking. 
                Customers will see the same tracking experience regardless of the mode.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hero Section Content Card */}
      <Card className="bg-[#121212] border-gray-800 shadow-xl">
        <CardHeader className="border-gray-800">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <ImageIcon className="text-accent-warm h-5 w-5" /> Homepage Hero Section Content
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Modify the texts, headers, description, and primary call-to-action button of the home hero block.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Section Subtitle / Tag</label>
              <Input
                name="heroSubtitle"
                defaultValue={initialSettings.hero.subtitle}
                placeholder="e.g. Premium Products"
                className="bg-black border-gray-700 text-white placeholder:text-gray-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Primary Button Text</label>
              <Input
                name="heroButtonText"
                defaultValue={initialSettings.hero.buttonText}
                placeholder="e.g. Explore Products"
                className="bg-black border-gray-700 text-white placeholder:text-gray-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Hero Main Title (Plain)</label>
              <Input
                name="heroTitle"
                defaultValue={initialSettings.hero.title}
                placeholder="e.g. Ideas"
                className="bg-black border-gray-700 text-white placeholder:text-gray-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Hero Title (Colored / Highlighted)</label>
              <Input
                name="heroColoredTitle"
                defaultValue={initialSettings.hero.coloredTitle}
                placeholder="e.g. Take Shape."
                className="bg-black border-gray-700 text-white placeholder:text-gray-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Hero Description</label>
            <Textarea
              name="heroDescription"
              defaultValue={initialSettings.hero.description}
              placeholder="Write a compelling introductory description for your storefront..."
              rows={4}
              className="bg-black border-gray-700 text-[#f4ecd9] placeholder:text-[#c7b798]"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Hero Showcase Card */}
      <Card className="bg-[#121212] border-gray-800 shadow-xl">
        <CardHeader className="border-gray-800">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <UploadCloud className="text-accent-warm h-5 w-5" /> Homepage Hero Image & Showcase
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Update the primary high-quality showcase image and its text overlay visible on the left side of the hero.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Showcase Title</label>
              <Input
                name="heroShowcaseTitle"
                defaultValue={initialSettings.hero.showcaseTitle}
                placeholder="e.g. Custom Product"
                className="bg-black border-gray-700 text-white placeholder:text-gray-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Showcase Title Italic / Accent</label>
              <Input
                name="heroShowcaseItalic"
                defaultValue={initialSettings.hero.showcaseItalic}
                placeholder="e.g. Design Made Easy"
                className="bg-black border-gray-700 text-white placeholder:text-gray-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Hero Character/Showcase Image</label>
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="relative w-full max-w-[200px] aspect-[14/16] rounded-2xl bg-gray-900 border border-gray-700 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                {heroPreview ? (
                  <img src={heroPreview} alt="Hero showcase preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="text-gray-600 h-12 w-12" />
                )}
              </div>
              <div className="flex-1 space-y-3">
                <Input
                  name="heroFile"
                  type="file"
                  accept="image/*"
                  onChange={handleHeroChange}
                  className="bg-black border-gray-700 text-white file:bg-gray-800 file:border-gray-600 file:text-gray-300"
                />
                <p className="text-xs text-gray-500 leading-relaxed">
                  Recommended: High-resolution vertical layout showcase image (aspect ratio roughly 14:16 or 3:4).
                  Uploading a new file will automatically replace the existing background image.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hero Featured Items Card */}
      <Card className="bg-[#121212] border-gray-800 shadow-xl">
        <CardHeader className="border-gray-800">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Sparkles className="text-accent-warm h-5 w-5" /> Homepage Hero Collection Grid (4 Items)
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Customize the four collection items displayed on the right grid of the homepage hero banner.
          </p>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((idx) => {
              const item = initialSettings.hero.featuredItems?.[idx] || { label: "", tag: "" };
              return (
                <div key={idx} className="p-4 rounded-xl border border-gray-800 bg-black/40 space-y-4">
                  <h3 className="text-sm font-bold text-accent-warm uppercase tracking-wider">
                    Item {idx + 1} Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400">Label / Title</label>
                      <Input
                        name={`item${idx}Label`}
                        defaultValue={item.label}
                        placeholder="e.g. Fantasy Resin Mask"
                        className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-forest"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400">Tag / Category</label>
                      <Input
                        name={`item${idx}Tag`}
                        defaultValue={item.tag}
                        placeholder="e.g. Classical Resin"
                        className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-forest"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400">Cover Image</label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-20 rounded-lg bg-gray-900 border border-gray-700 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                        {featuredPreviews[idx] ? (
                          <img src={featuredPreviews[idx]} alt={`Item ${idx + 1} preview`} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="text-gray-600 h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <Input
                          name={`item${idx}File`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFeaturedChange(idx, e)}
                          className="bg-black border-gray-700 text-white file:bg-gray-800 file:border-gray-600 file:text-gray-300 text-xs"
                        />
                        <p className="text-[10px] text-gray-500">
                          Recommended: 900x1200 vertical image (WEBP or JPG).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Hero Stats Card */}
      <Card className="bg-[#121212] border-gray-800 shadow-xl">
        <CardHeader className="border-gray-800">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Sparkles className="text-accent-warm h-5 w-5" /> Homepage Hero Statistics
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Customize the statistics displayed in the hero section (Products Created & Customer Rating).
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-4 rounded-xl border border-gray-800 bg-black/40">
              <h3 className="text-sm font-bold text-accent-warm uppercase tracking-wider">
                Products Statistic
              </h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400">Count/Number</label>
                  <Input
                    name="statsProductsCount"
                    defaultValue={initialSettings.hero.stats?.productsCount || "2.5k+"}
                    placeholder="e.g. 2.5k+"
                    className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-forest"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400">Label</label>
                  <Input
                    name="statsProductsLabel"
                    defaultValue={initialSettings.hero.stats?.productsLabel || "Products Created"}
                    placeholder="e.g. Products Created"
                    className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-forest"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 rounded-xl border border-gray-800 bg-black/40">
              <h3 className="text-sm font-bold text-accent-warm uppercase tracking-wider">
                Rating Statistic
              </h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400">Rating/Score</label>
                  <Input
                    name="statsRating"
                    defaultValue={initialSettings.hero.stats?.rating || "4.9/5"}
                    placeholder="e.g. 4.9/5"
                    className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-forest"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400">Label</label>
                  <Input
                    name="statsRatingLabel"
                    defaultValue={initialSettings.hero.stats?.ratingLabel || "Customer Rating"}
                    placeholder="e.g. Customer Rating"
                    className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-forest"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Submit Footer */}
      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="min-w-[150px] bg-forest text-cream hover:bg-forest-light py-3 font-semibold text-sm"
        >
          {isLoading ? "Saving Changes..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
