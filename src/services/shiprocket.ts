import { createAdminClient } from "@/lib/supabase/admin";
import { sendNotification } from "@/services/notifications";
import { trackEvent } from "@/lib/utils";

type AnyRecord = Record<string, any>;

type ShiprocketOrderContext = {
  id: string;
  created_at?: string | null;
  user_id: string;
  shiprocket_last_event?: string | null;
  shiprocket_last_synced_at?: string | null;
  status: string;
  total_amount?: number | null;
  payment_status: string;
  payment_method?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  shipping_phone?: string | null;
  shipping_line1?: string | null;
  shipping_line2?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_postal_code?: string | null;
  shipping_country?: string | null;
  parcel_weight_grams?: number | null;
  parcel_length_cm?: number | null;
  parcel_width_cm?: number | null;
  parcel_height_cm?: number | null;
  shiprocket_order_id?: string | null;
  shiprocket_shipment_id?: string | null;
  shiprocket_awb_number?: string | null;
  shiprocket_tracking_id?: string | null;
  shiprocket_courier_name?: string | null;
  shiprocket_label_pdf_url?: string | null;
  shiprocket_tracking_url?: string | null;
  shiprocket_status?: string | null;
  shiprocket_pickup_status?: string | null;
  shiprocket_tracking_events?: AnyRecord[] | null;
  shiprocket_payload?: AnyRecord | null;
  shiprocket_error?: string | null;
  users?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  addresses?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
  order_items?: Array<{
    id: string;
    name?: string | null;
    quantity: number;
    unit_price: number;
    products?: {
      name?: string | null;
      slug?: string | null;
      shipping_weight_grams?: number | null;
      shipping_length_cm?: number | null;
      shipping_width_cm?: number | null;
      shipping_height_cm?: number | null;
    } | null;
  }>;
};

const DEFAULT_BASE_URL = "https://apiv2.shiprocket.in/v1/external";
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

function getBaseUrl() {
  return (process.env.SHIPROCKET_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
}

function getTrackingUrl(awb: string) {
  return process.env.SHIPROCKET_TRACKING_URL_TEMPLATE?.replace("{awb}", encodeURIComponent(awb))
    ?? `https://shiprocket.co/tracking/${encodeURIComponent(awb)}`;
}

async function readJsonSafe(response: Response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

async function shiprocketLogin() {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error("Shiprocket credentials are not configured.");
  }

  const cacheKey = `${email}:${password}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  const response = await fetch(`${getBaseUrl()}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const payload = await readJsonSafe(response);
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Shiprocket login failed.");
  }

  const token = payload?.token || payload?.data?.token || payload?.access_token;
  if (!token) {
    throw new Error("Shiprocket login did not return an access token.");
  }

  tokenCache.set(cacheKey, { token, expiresAt: Date.now() + 14 * 60 * 1000 });
  return token as string;
}

async function shiprocketRequest(path: string, init: RequestInit = {}) {
  const token = await shiprocketLogin();
  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {})
    }
  });

  const payload = await readJsonSafe(response);
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || payload?.raw || "Shiprocket request failed.");
  }

  return payload;
}

function numberOrDefault(value: unknown, fallback: number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function formatOrderItems(order: ShiprocketOrderContext) {
  return (order.order_items ?? []).map((item) => {
    const product = item.products ?? {};
    return {
      name: item.name || product.name || "Product",
      sku: product.slug || item.id,
      units: item.quantity,
      selling_price: String(item.unit_price ?? 0),
      discount: "0",
      tax: "0",
      hsn: product.slug || "NA",
      weight: numberOrDefault(product.shipping_weight_grams, 250) / 1000
    };
  });
}

export function mapShiprocketStatus(status: string | null | undefined) {
  const normalized = String(status ?? "").trim().toLowerCase();
  if (!normalized) {
    return {
      shiprocket_status: "not_generated",
      shiprocket_pickup_status: "not_picked_up",
      order_status: "confirmed"
    };
  }

  if (["delivered", "delivery completed"].includes(normalized)) {
    return { shiprocket_status: "delivered", shiprocket_pickup_status: "picked_up", order_status: "delivered" };
  }
  if (["out for delivery", "ofd"].includes(normalized)) {
    return { shiprocket_status: "out_for_delivery", shiprocket_pickup_status: "picked_up", order_status: "shipped" };
  }
  if (["in transit", "shipped"].includes(normalized)) {
    return { shiprocket_status: "in_transit", shiprocket_pickup_status: "picked_up", order_status: "shipped" };
  }
  if (["picked up", "pickup completed"].includes(normalized)) {
    return { shiprocket_status: "picked_up", shiprocket_pickup_status: "picked_up", order_status: "shipped" };
  }
  if (["manifested", "manifest", "manifested shipment"].includes(normalized)) {
    return { shiprocket_status: "manifested", shiprocket_pickup_status: "not_picked_up", order_status: "processing" };
  }
  if (["label generated", "label_generated"].includes(normalized)) {
    return { shiprocket_status: "label_generated", shiprocket_pickup_status: "not_picked_up", order_status: "processing" };
  }
  if (["cancelled", "canceled"].includes(normalized)) {
    return { shiprocket_status: "cancelled", shiprocket_pickup_status: "not_picked_up", order_status: "cancelled" };
  }
  return { shiprocket_status: normalized.replace(/\s+/g, "_"), shiprocket_pickup_status: "not_picked_up", order_status: "confirmed" };
}

function buildWebhookEvent(payload: AnyRecord) {
  const status = String(payload?.current_status ?? payload?.status ?? payload?.shipment_status ?? payload?.event ?? "");
  const timestamp = payload?.event_time || payload?.updated_at || payload?.created_at || new Date().toISOString();
  return {
    raw_status: status,
    shiprocket_status: mapShiprocketStatus(status).shiprocket_status,
    timestamp,
    payload
  };
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    const fallback = fullName.trim() || "Customer";
    return { firstName: fallback, lastName: fallback };
  }
  return {
    firstName: parts.shift() || "Customer",
    lastName: parts.join(" ")
  };
}

export function buildShiprocketPayload(order: ShiprocketOrderContext) {
  const billingName = order.customer_name || order.users?.name || "Customer";
  const billingEmail = order.customer_email || order.users?.email || "";
  const billingPhone = order.shipping_phone || order.users?.phone || "";
  const address1 = order.shipping_line1 || order.addresses?.line1 || "";
  const address2 = order.shipping_line2 || order.addresses?.line2 || "";
  const city = order.shipping_city || order.addresses?.city || "";
  const state = order.shipping_state || order.addresses?.state || "";
  const postalCode = order.shipping_postal_code || order.addresses?.postal_code || "";
  const country = order.shipping_country || order.addresses?.country || "India";
  const billingCountry = country === "IN" ? "India" : country;
  const shippingCountry = country === "IN" ? "India" : country;
  const { lastName } = splitName(billingName);

  if (!billingName || !billingEmail || !billingPhone || !address1 || !city || !state || !postalCode) {
    throw new Error("Missing shipping details required for Shiprocket order creation.");
  }

  const weightKg = Math.max(0.25, numberOrDefault(order.parcel_weight_grams, 250) / 1000);
  const length = numberOrDefault(order.parcel_length_cm, 20);
  const width = numberOrDefault(order.parcel_width_cm, 15);
  const height = numberOrDefault(order.parcel_height_cm, 10);
  const paymentMethod = String(order.payment_method ?? "cod").toLowerCase() === "cod" ? "COD" : "Prepaid";

  return {
    order_id: order.id,
    order_date: order.created_at ?? new Date().toISOString(),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
    billing_customer_name: billingName,
    billing_last_name: lastName,
    billing_address: address1,
    billing_address_2: address2,
    billing_city: city,
    billing_pincode: postalCode,
    billing_state: state,
    billing_country: billingCountry,
    billing_email: billingEmail,
    billing_phone: billingPhone,
    shipping_is_billing: true,
    shipping_customer_name: billingName,
    shipping_last_name: lastName,
    shipping_address: address1,
    shipping_address_2: address2,
    shipping_city: city,
    shipping_pincode: postalCode,
    shipping_state: state,
    shipping_country: shippingCountry,
    shipping_email: billingEmail,
    shipping_phone: billingPhone,
    order_items: formatOrderItems(order),
    payment_method: paymentMethod,
    sub_total: String(Math.round(numberOrDefault(order.total_amount, 0) * 100) / 100),
    length: String(length),
    breadth: String(width),
    height: String(height),
    weight: String(weightKg)
  };
}

export async function syncOrderWithShiprocket(orderId: string) {
  const supabase = createAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error) {
    throw error;
  }

  const [userResult, addressResult, itemsResult] = await Promise.all([
    supabase.from("users").select("name, email, phone").eq("id", order.user_id).maybeSingle(),
    order.shipping_address_id ? supabase.from("addresses").select("line1, line2, city, state, postal_code, country").eq("id", order.shipping_address_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    supabase.from("order_items").select("id, name, quantity, unit_price, product_id").eq("order_id", order.id)
  ]);

  const orderItems = (itemsResult.data ?? []).length > 0
    ? await Promise.all((itemsResult.data ?? []).map(async (item: any) => {
        const { data: product } = await supabase
          .from("products")
          .select("name, slug, shipping_weight_grams, shipping_length_cm, shipping_width_cm, shipping_height_cm")
          .eq("id", item.product_id)
          .maybeSingle();

        return {
          ...item,
          products: product
        };
      }))
    : [];

  const current = {
    ...(order as ShiprocketOrderContext),
    users: userResult.data ?? null,
    addresses: addressResult.data ?? null,
    order_items: orderItems
  };
  if (current.shiprocket_awb_number && current.shiprocket_label_pdf_url) {
    return current;
  }

  const payload = buildShiprocketPayload(current);
  const createResult = await shiprocketRequest("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  const shiprocketOrderId = String(createResult?.order_id || createResult?.data?.order_id || createResult?.shipment_id || current.shiprocket_order_id || "");
  const shipmentId = String(createResult?.shipment_id || createResult?.data?.shipment_id || current.shiprocket_shipment_id || "");

  const awbResult = shipmentId
    ? await shiprocketRequest("/courier/assign/awb", {
        method: "POST",
        body: JSON.stringify({ shipment_id: shipmentId })
      })
    : createResult;

  const awbNumber = String(
    awbResult?.awb_code ||
    awbResult?.data?.awb_code ||
    awbResult?.awb_number ||
    createResult?.awb_code ||
    current.shiprocket_awb_number ||
    ""
  );
  const courierName = String(
    awbResult?.courier_name ||
    awbResult?.data?.courier_name ||
    createResult?.courier_name ||
    current.shiprocket_courier_name ||
    ""
  );
  const trackingId = String(
    awbResult?.tracking_id ||
    awbResult?.data?.tracking_id ||
    createResult?.tracking_id ||
    awbNumber ||
    shipmentId ||
    ""
  );

  const labelResult = shipmentId
    ? await shiprocketRequest("/courier/generate/label", {
        method: "POST",
        body: JSON.stringify({ shipment_id_list: [shipmentId] })
      })
    : createResult;

  const labelPdfUrl = String(
    labelResult?.label_url ||
    labelResult?.data?.label_url ||
    labelResult?.label_pdf_url ||
    labelResult?.data?.label_pdf_url ||
    current.shiprocket_label_pdf_url ||
    ""
  );

  const trackingUrl = awbNumber ? getTrackingUrl(awbNumber) : current.shiprocket_tracking_url || "";
  const now = new Date().toISOString();

  const update = {
    shiprocket_order_id: shiprocketOrderId || current.shiprocket_order_id,
    shiprocket_shipment_id: shipmentId || current.shiprocket_shipment_id,
    shiprocket_awb_number: awbNumber || current.shiprocket_awb_number,
    shiprocket_tracking_id: trackingId || current.shiprocket_tracking_id,
    shiprocket_courier_name: courierName || current.shiprocket_courier_name,
    shiprocket_label_pdf_url: labelPdfUrl || current.shiprocket_label_pdf_url,
    shiprocket_tracking_url: trackingUrl || current.shiprocket_tracking_url,
    shiprocket_status: awbNumber ? "label_generated" : (current.shiprocket_status ?? "not_generated"),
    shiprocket_pickup_status: current.shiprocket_pickup_status ?? "not_picked_up",
    shiprocket_payload: {
      create: createResult,
      awb: awbResult,
      label: labelResult,
      request: payload
    },
    shiprocket_last_event: awbNumber ? "label_generated" : current.shiprocket_last_event,
    shiprocket_last_synced_at: now,
    shiprocket_error: null
  };

  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update(update)
    .eq("id", orderId)
    .select("*")
    .single();

  if (updateError) {
    throw updateError;
  }

  await trackEvent("admin_action", current.user_id, {
    action: "shiprocket_sync",
    orderId,
    awbNumber,
    shipmentId
  });

  if (awbNumber) {
    await sendNotification(
      current.user_id,
      "order_update",
      "Shipping label generated",
      `Your order ${orderId.slice(0, 8)} is ready to ship with AWB ${awbNumber}.`
    );
  }

  return updatedOrder;
}

export async function applyShiprocketWebhook(payload: AnyRecord) {
  const supabase = createAdminClient();
  const awbNumber = String(payload?.awb_code ?? payload?.awb ?? payload?.awbNumber ?? payload?.awb_number ?? "");
  const trackingId = String(payload?.tracking_id ?? payload?.trackingId ?? "");
  const shiprocketOrderId = String(payload?.order_id ?? payload?.shiprocket_order_id ?? "");
  const status = String(payload?.current_status ?? payload?.status ?? payload?.shipment_status ?? payload?.event ?? "");

  let query = supabase.from("orders").select("*");
  if (shiprocketOrderId) {
    query = query.eq("shiprocket_order_id", shiprocketOrderId);
  } else if (awbNumber) {
    query = query.eq("shiprocket_awb_number", awbNumber);
  } else if (trackingId) {
    query = query.eq("shiprocket_tracking_id", trackingId);
  } else {
    throw new Error("Shiprocket webhook payload does not contain an order identifier.");
  }

  const { data: order, error } = await query.maybeSingle();
  if (error) {
    throw error;
  }
  if (!order) {
    throw new Error("Matching order not found for Shiprocket webhook.");
  }

  const mapped = mapShiprocketStatus(status);
  const event = buildWebhookEvent(payload);
  const existingEvents = Array.isArray(order.shiprocket_tracking_events) ? order.shiprocket_tracking_events : [];

  const { error: updateError } = await supabase.from("orders").update({
    shiprocket_status: mapped.shiprocket_status,
    shiprocket_pickup_status: mapped.shiprocket_pickup_status,
    status: mapped.order_status,
    shiprocket_awb_number: awbNumber || order.shiprocket_awb_number,
    shiprocket_tracking_id: trackingId || order.shiprocket_tracking_id,
    shiprocket_courier_name: payload?.courier_name || payload?.courier || order.shiprocket_courier_name,
    shiprocket_tracking_events: [event, ...existingEvents].slice(0, 25),
    shiprocket_last_event: event.raw_status || mapped.shiprocket_status,
    shiprocket_last_synced_at: new Date().toISOString(),
    shiprocket_payload: {
      ...(order.shiprocket_payload ?? {}),
      webhook: payload
    },
    shiprocket_error: null
  }).eq("id", order.id);

  if (updateError) {
    throw updateError;
  }

  if (mapped.order_status === "delivered") {
    await sendNotification(order.user_id, "order_update", "Order delivered", `Order ${order.id.slice(0, 8)} has been delivered.`);
  } else if (mapped.order_status === "shipped") {
    await sendNotification(order.user_id, "order_update", "Order shipped", `Order ${order.id.slice(0, 8)} is on the way.`);
  }

  return { orderId: order.id, status: mapped.order_status, awbNumber };
}

export async function queueShiprocketRetry(orderId: string, errorMessage: string) {
  const supabase = createAdminClient();
  await supabase.from("orders").update({
    shiprocket_error: errorMessage,
    shiprocket_last_synced_at: new Date().toISOString()
  }).eq("id", orderId);
}
