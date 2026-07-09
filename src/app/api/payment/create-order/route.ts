import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/guards";
import { getGlobalShippingMode } from "@/lib/shipping/provider";

export async function POST(request: Request) {
  try {
    const user = await requireUser(false);
    const body = await request.json();
    const amount = Number(body.amount ?? 0);

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: body.currency ?? "INR",
      receipt: `rcpt_${Date.now()}`
    });

    const supabase = createAdminClient();
    
    // Get the current shipping mode
    const shippingMode = await getGlobalShippingMode();
    
    await supabase.from("orders").insert({
      user_id: user.id,
      status: "pending",
      payment_status: "pending",
      payment_method: body.paymentMethod ?? "prepaid",
      total_amount: amount,
      razorpay_order_id: order.id,
      shipping_mode: shippingMode,
      shipping_provider: shippingMode === "AUTOMATIC" ? "shiprocket" : "manual"
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
