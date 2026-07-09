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
  
  const { data: setting } = await supabase
    .from("application_settings")
    .select("value")
    .eq("key", "shipping_mode")
    .single();

  return (setting?.value as "AUTOMATIC" | "MANUAL") || "AUTOMATIC";
}

/**
 * Update global shipping mode
 */
export async function updateGlobalShippingMode(mode: "AUTOMATIC" | "MANUAL"): Promise<void> {
  const supabase = createAdminClient();
  
  await supabase
    .from("application_settings")
    .upsert({
      key: "shipping_mode",
      value: mode,
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
