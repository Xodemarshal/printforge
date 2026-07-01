"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/guards";
import { sendNotification } from "@/services/notifications";
import { createRazorpayOrder, razorpay } from "@/lib/razorpay";
import { queueShiprocketRetry, syncOrderWithShiprocket } from "@/services/shiprocket";
import { sendOrderConfirmationEmail } from "@/services/email";
import { linkCustomerToOrder } from "@/services/customer";
import { trackPaymentSuccess } from "@/services/analytics";
import { markCartAsRecovered } from "@/services/cart";

interface CheckoutData {
  idempotencyKey: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  shippingAddress: {
    fullName?: string;
    phone?: string;
    email?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  discountAmount?: number;
  couponId?: string;
}

function normalizePaymentMethod(value: string) {
  return value.trim().toLowerCase();
}

function buildPackageMetrics(products: Array<{
  quantity: number;
  shipping_weight_grams?: number | null;
  shipping_length_cm?: number | null;
  shipping_width_cm?: number | null;
  shipping_height_cm?: number | null;
}>) {
  let totalWeight = 0;
  let maxLength = 20;
  let maxWidth = 15;
  let maxHeight = 10;

  for (const item of products) {
    const quantity = Number(item.quantity ?? 1);
    const weight = Number(item.shipping_weight_grams ?? 250);
    const length = Number(item.shipping_length_cm ?? 20);
    const width = Number(item.shipping_width_cm ?? 15);
    const height = Number(item.shipping_height_cm ?? 10);

    totalWeight += Math.max(1, quantity) * Math.max(1, weight);
    maxLength = Math.max(maxLength, length);
    maxWidth = Math.max(maxWidth, width);
    maxHeight = Math.max(maxHeight, height);
  }

  return {
    parcelWeightGrams: Math.max(250, totalWeight),
    parcelLengthCm: Math.max(10, maxLength),
    parcelWidthCm: Math.max(10, maxWidth),
    parcelHeightCm: Math.max(10, maxHeight)
  };
}

export async function createOrderAction(data: CheckoutData) {
  const user = await requireUser();
  const supabase = createAdminClient();
  const paymentMethod = normalizePaymentMethod(data.paymentMethod);
  if (paymentMethod !== "razorpay") {
    return { error: "Invalid payment method. Only online payments via Razorpay are supported." };
  }
  const { data: profile } = await supabase
    .from("users")
    .select("name, email, phone")
    .eq("id", user.id)
    .maybeSingle();

  try {
    if (String(data.shippingAddress.country ?? "").toUpperCase() !== "IN") {
      return { error: "Shiprocket shipping currently supports Indian delivery addresses only." };
    }

    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id, shiprocket_awb_number, shiprocket_label_pdf_url, shiprocket_tracking_url")
      .eq("idempotency_key", data.idempotencyKey)
      .maybeSingle();

    if (existingOrder) {
      return {
        success: true,
        orderId: existingOrder.id,
        shiprocketAwbNumber: existingOrder.shiprocket_awb_number,
        shiprocketLabelPdfUrl: existingOrder.shiprocket_label_pdf_url,
        shiprocketTrackingUrl: existingOrder.shiprocket_tracking_url
      };
    }

    const uniqueProductIds = Array.from(new Set(data.items.map((item) => item.productId)));
    const { data: productRows, error: productError } = await supabase
      .from("products")
      .select("id, name, slug, shipping_weight_grams, shipping_length_cm, shipping_width_cm, shipping_height_cm")
      .in("id", uniqueProductIds);

    if (productError) {
      throw productError;
    }

    const productLookup = new Map((productRows ?? []).map((product: any) => [product.id, product]));
    const packageMetrics = buildPackageMetrics(
      data.items.map((item) => ({
        quantity: item.quantity,
        ...(productLookup.get(item.productId) ?? {})
      }))
    );

    const customerName = data.shippingAddress.fullName || profile?.name || user.user_metadata?.name || user.email?.split("@")[0] || "Customer";
    const customerEmail = data.shippingAddress.email || profile?.email || user.email || "";
    const customerPhone = data.shippingAddress.phone || profile?.phone || "";

    if (!customerPhone) {
      return { error: "Customer phone number is required for shipping." };
    }
    if (!/^[0-9+\-\s]{8,15}$/.test(customerPhone)) {
      return { error: "Enter a valid phone number for Shiprocket shipping." };
    }
    if (!/^\d{6}$/.test(String(data.shippingAddress.zipCode ?? ""))) {
      return { error: "Enter a valid 6 digit pincode for Shiprocket shipping." };
    }

    // First, create or get the shipping address
    const { data: address, error: addressError } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        line1: data.shippingAddress.street,
        line2: null,
        city: data.shippingAddress.city,
        state: data.shippingAddress.state,
        postal_code: data.shippingAddress.zipCode,
        country: data.shippingAddress.country,
        is_default: false
      })
      .select()
      .single();

    if (addressError) {
      console.error("Address insert error:", addressError);
      throw addressError;
    }

    // Create Razorpay order if payment method requires it
    let razorpayOrderId :string | null = null;
    if (paymentMethod === "razorpay") {
      const razorpayResult = await createRazorpayOrder(data.total, "INR");
      if (razorpayResult.success && razorpayResult.order) {
        razorpayOrderId = razorpayResult.order.id;
      }
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        idempotency_key: data.idempotencyKey,
        user_id: user.id,
        status: "pending",
        total_amount: data.total,
        discount_amount: data.discountAmount || 0,
        shipping_address_id: address.id,
        payment_status: "pending",
        payment_method: paymentMethod,
        customer_name: customerName,
        customer_email: customerEmail,
        shipping_phone: customerPhone,
        shipping_line1: data.shippingAddress.street,
        shipping_line2: null,
        shipping_city: data.shippingAddress.city,
        shipping_state: data.shippingAddress.state,
        shipping_postal_code: data.shippingAddress.zipCode,
        shipping_country: data.shippingAddress.country,
        parcel_weight_grams: packageMetrics.parcelWeightGrams,
        parcel_length_cm: packageMetrics.parcelLengthCm,
        parcel_width_cm: packageMetrics.parcelWidthCm,
        parcel_height_cm: packageMetrics.parcelHeightCm,
        shipping_provider: "shiprocket",
        razorpay_order_id: razorpayOrderId,
        notes: `Payment method: ${data.paymentMethod}${data.couponId ? ` | Coupon: ${data.couponId}` : ""}`
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order insert error:", orderError);
      throw orderError;
    }

    // If coupon used, increment its use count
    if (data.couponId) {
      try {
        await supabase.rpc('increment_coupon_usage', { coupon_id: data.couponId });
      } catch (rpcError) {
        // RPC might not exist in mock mode, that's ok
        console.warn('Could not increment coupon usage (expected in mock mode)');
      }
    }

    // Create order items with correct column names
    const orderItems = data.items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.price
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      throw itemsError;
    }

    // Link customer and update stats
    await linkCustomerToOrder(order.id, {
      email: customerEmail,
      phone: customerPhone,
      name: customerName
    });

    // Send notification
    const addressStr = `${data.shippingAddress.street}, ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}, ${data.shippingAddress.country}`;
    await sendNotification(
      user.id,
      "order_placed",
      "Order Placed Successfully",
      `Your order #${order.id.slice(0, 8)} has been placed. Total: $${data.total.toFixed(2)}. Payment: ${data.paymentMethod}. Shipping to: ${addressStr}`
    );

    return { 
      success: true, 
      orderId: order.id,
      razorpayOrderId,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    };
  } catch (error: any) {
    console.error("Order creation error:", error);
    return { error: error.message || "Failed to create order" };
  }
}

export async function verifyPaymentAction(orderId: string, razorpayPaymentId: string, _razorpaySignature: string) {
  const supabase = createAdminClient();
  
  try {
    // Fetch the existing order details
    const { data: orderData } = await supabase
      .from("orders")
      .select("notes, payment_method, total_amount, user_id, customer_name, customer_email")
      .eq("id", orderId)
      .maybeSingle();

    if (!orderData) {
      return { error: "Order not found" };
    }

    let actualPaymentMethod = "razorpay";
    try {
      const payment = await razorpay.payments.fetch(razorpayPaymentId);
      if (payment && payment.method) {
        actualPaymentMethod = `razorpay_${payment.method}`;
      }
    } catch (err) {
      console.error("Failed to fetch Razorpay payment details:", err);
    }

    let notesUpdate = orderData.notes || "";
    const initialMethod = orderData.payment_method || "razorpay";
    if (notesUpdate.includes(`Payment method: ${initialMethod}`)) {
      notesUpdate = notesUpdate.replace(`Payment method: ${initialMethod}`, `Payment method: ${actualPaymentMethod}`);
    } else if (notesUpdate) {
      notesUpdate = `Payment method: ${actualPaymentMethod} | ${notesUpdate}`;
    } else {
      notesUpdate = `Payment method: ${actualPaymentMethod}`;
    }

    // Update order with payment details
    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        razorpay_payment_id: razorpayPaymentId,
        status: "confirmed",
        payment_method: actualPaymentMethod,
        notes: notesUpdate
      })
      .eq("id", orderId);

    if (error) throw error;

    // Link customer and update stats
    if (orderData.customer_email) {
      await linkCustomerToOrder(orderId, {
        email: orderData.customer_email,
        name: orderData.customer_name || 'Customer'
      });
    }

    // Track payment success
    await trackPaymentSuccess(
      orderId,
      orderData.total_amount,
      orderData.user_id
    );

    // Send order confirmation email
    if (orderData.customer_email) {
      await sendOrderConfirmationEmail({
        orderId,
        customerName: orderData.customer_name || 'Customer',
        customerEmail: orderData.customer_email,
        totalAmount: orderData.total_amount,
        orderStatus: 'Confirmed'
      });
    }

    // Sync with Shiprocket
    try {
      await syncOrderWithShiprocket(orderId);
    } catch (shiprocketError: any) {
      await queueShiprocketRetry(orderId, shiprocketError?.message || "Shiprocket sync failed");
      console.error("Shiprocket sync failed after payment verification:", shiprocketError);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return { error: error.message || "Payment verification failed" };
  }
}
