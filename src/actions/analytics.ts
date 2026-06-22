'use server';

import { trackCartSession as trackCartSessionService } from '@/services/cart';
import { trackEvent as trackEventService, type AnalyticsEvent } from '@/services/analytics';
import { createAdminClient } from '@/lib/supabase/admin';
import type { CartItem } from '@/types';

/**
 * Track cart session from client
 */
export async function trackCartSession(
  sessionId: string,
  cartItems: CartItem[],
  userId?: string | null
) {
  return trackCartSessionService(sessionId, cartItems, userId);
}

/**
 * Track analytics event from client
 */
export async function trackEvent(
  eventName: AnalyticsEvent,
  options: {
    userId?: string | null;
    productId?: string | null;
    orderId?: string | null;
    revenue?: number;
    cartValue?: number;
    metadata?: Record<string, any>;
  } = {}
) {
  return trackEventService({
    eventName,
    ...options
  });
}

/**
 * Create a lead from contact form
 */
export async function createLead(data: {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  source: string;
  productId?: string;
  metadata?: Record<string, any>;
}) {
  const supabase = createAdminClient();

  try {
    const { error } = await supabase
      .from('leads')
      .insert({
        name: data.name || null,
        email: data.email || null,
        phone: data.phone || null,
        message: data.message || null,
        source: data.source,
        product_id: data.productId || null,
        metadata: data.metadata || {}
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Create lead error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark cart as recovered after purchase
 */
export async function markCartRecovered(sessionId: string) {
  const supabase = createAdminClient();

  try {
    const { error } = await supabase
      .from('cart_sessions')
      .update({
        recovered: true,
        recovered_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
      .eq('abandoned', true);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Mark cart recovered error:', error);
    return { success: false, error: error.message };
  }
}
