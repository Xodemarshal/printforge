import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyHmacSignature } from "@/lib/utils";
import { sendNotification } from "@/services/notifications";
import { trackEvent } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = `${body.razorpay_order_id}|${body.razorpay_payment_id}`;
    const verified = verifyHmacSignature(
      payload,
      String(body.razorpay_signature ?? ""),
      process.env.RAZORPAY_KEY_SECRET ?? ""
    );

    if (!verified) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: order } = await supabase
      .from("orders")
      .select("id, user_id")
      .eq("razorpay_order_id", body.razorpay_order_id)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await supabase.from("orders").update({
      payment_status: "paid",
      status: "confirmed",
      razorpay_payment_id: body.razorpay_payment_id
    }).eq("id", order.id);

    const cartItems = Array.isArray(body.items) ? body.items : [];
    if (cartItems.length > 0) {
      await supabase.from("order_items").insert(
        cartItems.map((item: { product_id: string; quantity: number; price: number; name?: string }) => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price,
          name: item.name ?? ""
        }))
      );
    }

    await trackEvent("order_completed", order.user_id, {
      razorpayOrderId: body.razorpay_order_id,
      razorpayPaymentId: body.razorpay_payment_id
    });
    await sendNotification(order.user_id, "order_update", "Order confirmed", "Your payment has been verified and your order is confirmed.");
    return NextResponse.json({ success: true, clearCart: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
