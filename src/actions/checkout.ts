"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/guards";
import { sendNotification } from "@/services/notifications";
import { createRazorpayOrder } from "@/lib/razorpay";

interface CheckoutData {
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  shippingAddress: {
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

export async function createOrderAction(data: CheckoutData) {
  const user = await requireUser();
  const supabase = createAdminClient();

  try {
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
    let razorpayOrderId = null;
    if (["card", "upi", "bank-transfer"].includes(data.paymentMethod)) {
      const razorpayResult = await createRazorpayOrder(data.total, "INR");
      if (razorpayResult.success && razorpayResult.order) {
        razorpayOrderId = razorpayResult.order.id;
      }
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        total_amount: data.total,
        discount_amount: data.discountAmount || 0,
        shipping_address_id: address.id,
        payment_status: "pending",
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

export async function verifyPaymentAction(orderId: string, razorpayPaymentId: string, razorpaySignature: string) {
  const supabase = createAdminClient();
  
  try {
    // Update order with payment details
    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: "completed",
        razorpay_payment_id: razorpayPaymentId,
        status: "confirmed"
      })
      .eq("id", orderId);

    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return { error: error.message || "Payment verification failed" };
  }
}
