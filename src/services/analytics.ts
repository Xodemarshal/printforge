import { createAdminClient } from '@/lib/supabase/admin';

export type AnalyticsEvent =
  | 'product_view'
  | 'product_gallery_view'
  | 'product_image_click'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'checkout_started'
  | 'payment_attempted'
  | 'payment_success'
  | 'order_completed'
  | 'whatsapp_click'
  | 'contact_form_submit'
  | 'search_performed'
  | 'wishlist_toggled';

interface TrackEventOptions {
  eventName: AnalyticsEvent;
  userId?: string | null;
  productId?: string | null;
  orderId?: string | null;
  sessionId?: string;
  pageUrl?: string;
  referrer?: string;
  deviceType?: string;
  browser?: string;
  country?: string;
  revenue?: number;
  cartValue?: number;
  metadata?: Record<string, any>;
}

/**
 * Track analytics event with session management
 */
export async function trackEvent(options: TrackEventOptions): Promise<{ success: boolean }> {
  const supabase = createAdminClient();

  try {
    const eventData: any = {
      event_name: options.eventName,
      event_type: options.eventName, // Backward compatibility
      user_id: options.userId || null,
      product_id: options.productId || null,
      order_id: options.orderId || null,
      session_id: options.sessionId || generateSessionId(),
      page_url: options.pageUrl || null,
      referrer: options.referrer || null,
      device_type: options.deviceType || null,
      browser: options.browser || null,
      country: options.country || null,
      revenue: options.revenue || null,
      cart_value: options.cartValue || null,
      metadata: options.metadata || {}
    };

    const { error } = await supabase
      .from('analytics_events')
      .insert(eventData);

    if (error) {
      console.error('Analytics tracking error:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return { success: false };
  }
}

/**
 * Track product view
 */
export async function trackProductView(
  productId: string,
  userId?: string | null,
  sessionId?: string
) {
  return trackEvent({
    eventName: 'product_view',
    productId,
    userId,
    sessionId: sessionId || generateSessionId(),
    pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    referrer: typeof window !== 'undefined' ? document.referrer : undefined,
    deviceType: getDeviceType(),
    browser: getBrowser()
  });
}

/**
 * Track add to cart
 */
export async function trackAddToCart(
  productId: string,
  cartValue: number,
  userId?: string | null,
  sessionId?: string
) {
  return trackEvent({
    eventName: 'add_to_cart',
    productId,
    userId,
    cartValue,
    sessionId: sessionId || generateSessionId(),
    pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    deviceType: getDeviceType(),
    browser: getBrowser()
  });
}

/**
 * Track checkout started
 */
export async function trackCheckoutStarted(
  cartValue: number,
  userId?: string | null,
  sessionId?: string
) {
  return trackEvent({
    eventName: 'checkout_started',
    userId,
    cartValue,
    sessionId: sessionId || generateSessionId(),
    pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    deviceType: getDeviceType(),
    browser: getBrowser()
  });
}

/**
 * Track payment success
 */
export async function trackPaymentSuccess(
  orderId: string,
  revenue: number,
  userId?: string | null,
  sessionId?: string
) {
  return trackEvent({
    eventName: 'payment_success',
    orderId,
    userId,
    revenue,
    sessionId: sessionId || generateSessionId(),
    pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    deviceType: getDeviceType(),
    browser: getBrowser()
  });
}

/**
 * Track WhatsApp click
 */
export async function trackWhatsAppClick(
  productId?: string | null,
  userId?: string | null,
  metadata?: Record<string, any>
) {
  return trackEvent({
    eventName: 'whatsapp_click',
    productId,
    userId,
    sessionId: generateSessionId(),
    pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    deviceType: getDeviceType(),
    browser: getBrowser(),
    metadata
  });
}

/**
 * Track contact form submission
 */
export async function trackContactFormSubmit(
  userId?: string | null,
  metadata?: Record<string, any>
) {
  return trackEvent({
    eventName: 'contact_form_submit',
    userId,
    sessionId: generateSessionId(),
    pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    deviceType: getDeviceType(),
    browser: getBrowser(),
    metadata
  });
}

/**
 * Generate or retrieve session ID
 */
export function generateSessionId(): string {
  if (typeof window === 'undefined') {
    return `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  const storageKey = 'analytics_session_id';
  let sessionId = sessionStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}

/**
 * Get device type
 */
export function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown';

  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Get browser name
 */
export function getBrowser(): string {
  if (typeof window === 'undefined') return 'unknown';

  const ua = navigator.userAgent;
  let browser = 'unknown';

  if (ua.indexOf('Firefox') > -1) {
    browser = 'Firefox';
  } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
    browser = 'Opera';
  } else if (ua.indexOf('Trident') > -1) {
    browser = 'IE';
  } else if (ua.indexOf('Edge') > -1) {
    browser = 'Edge';
  } else if (ua.indexOf('Chrome') > -1) {
    browser = 'Chrome';
  } else if (ua.indexOf('Safari') > -1) {
    browser = 'Safari';
  }

  return browser;
}

/**
 * Get user's country (requires a geolocation service or Cloudflare headers)
 */
export function getCountryFromHeaders(headers: Headers): string | null {
  // Cloudflare provides CF-IPCountry header
  return headers.get('cf-ipcountry') || null;
}
