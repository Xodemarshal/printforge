import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AnalyticsEventType } from "@/types";

const requestCounters = new Map<string, { count: number; expiresAt: number }>();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function trackEvent(
  type: AnalyticsEventType,
  userId: string | null,
  metadata: Record<string, unknown> = {}
) {
  const supabase = createAdminClient();
  await supabase.from("analytics_events").insert({
    event_type: type,
    user_id: userId,
    metadata
  });
}

export function verifyHmacSignature(payload: string, signature: string, secret: string) {
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

export function rateLimit(key: string, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  const entry = requestCounters.get(key);

  if (!entry || entry.expiresAt <= now) {
    requestCounters.set(key, { count: 1, expiresAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.expiresAt };
  }

  entry.count += 1;
  requestCounters.set(key, entry);
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.expiresAt };
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(amount);
}
