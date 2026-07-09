/**
 * Shipping Provider Interface
 * Central interface for all shipping providers
 */

import type { 
  ShippingProvider, 
  ShipmentResult, 
  CancelResult, 
  TrackingResult, 
  LabelResult 
} from "@/types/shipping";
import { ShiprocketProvider } from "./shiprocket";
import { ManualShippingProvider } from "./manual";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Get global shipping mode from settings
 */
export async function getGlobalShippingMode(): Promise<"AUTOMATIC" | "MANUAL"> {
  const supabase = createAdminClient();
  
  // Get the site_settings JSON object
  const { data: setting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "site_settings")
    .single();

  if (!setting || !setting.value) {
    return "AUTOMATIC";
  }

  try {
    // Parse the JSON object
    const siteSettings = typeof setting.value === 'string' 
      ? JSON.parse(setting.value) 
      : setting.value;
    
    // Get shipping mode from site_settings.shippingMode or default to AUTOMATIC
    const shippingMode = siteSettings?.shippingMode || siteSettings?.shipping_mode;
    return (shippingMode === "MANUAL" ? "MANUAL" : "AUTOMATIC");
  } catch {
    return "AUTOMATIC";
  }
}

/**
 * Update global shipping mode
 */
export async function updateGlobalShippingMode(mode: "AUTOMATIC" | "MANUAL"): Promise<void> {
  const supabase = createAdminClient();
  
  // First get the current site_settings
  const { data: currentSetting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "site_settings")
    .single();

  let siteSettings: any = {};
  
  if (currentSetting && currentSetting.value) {
    try {
      siteSettings = typeof currentSetting.value === 'string' 
        ? JSON.parse(currentSetting.value) 
        : currentSetting.value;
    } catch {
      // If parsing fails, start with empty object
      siteSettings = {};
    }
  }

  // Update the shipping mode in the site_settings object
  siteSettings.shippingMode = mode;
  
  // Update the entire site_settings JSON object
  await supabase
    .from("settings")
    .upsert({
      key: "site_settings",
      value: siteSettings,
      updated_at: new Date().toISOString()
    });
}

/**
 * Factory function to get the appropriate shipping provider
 */
export function getShippingProvider(mode: "AUTOMATIC" | "MANUAL"): ShippingProvider {
  switch (mode) {
    case "AUTOMATIC":
      return new ShiprocketProvider();
    case "MANUAL":
      return new ManualShippingProvider();
    default:
      throw new Error(`Unknown shipping mode: ${mode}`);
  }
}

/**
 * Get provider based on global shipping mode
 */
export async function getShippingProviderFromGlobalMode(): Promise<ShippingProvider> {
  const mode = await getGlobalShippingMode();
  return getShippingProvider(mode);
}

/**
 * Get provider by name (for future extensibility)
 */
export function getProviderByName(providerName: string): ShippingProvider {
  const normalized = providerName.toUpperCase();
  
  if (normalized === "SHIPROCKET" || normalized === "AUTOMATIC") {
    return new ShiprocketProvider();
  }
  
  if (normalized === "MANUAL") {
    return new ManualShippingProvider();
  }
  
  throw new Error(`Unknown provider: ${providerName}`);
}

/**
 * List all available providers
 */
export function listProviders() {
  return [
    { name: "AUTOMATIC", label: "Automatic (Shiprocket)", description: "Automated shipping via Shiprocket API" },
    { name: "MANUAL", label: "Manual Shipping", description: "Manually managed shipping (India Post, DTDC, etc.)" }
  ];
}
