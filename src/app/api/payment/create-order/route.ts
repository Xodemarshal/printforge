import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/guards";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
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
    await supabase.from("orders").insert({
      user_id: user.id,
      status: "pending",
      payment_status: "pending",
      total_amount: amount,
      razorpay_order_id: order.id
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
