import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/guards";
import { createRazorpayOrder } from "@/lib/razorpay";
import { resolvePreorderPrice } from "@/lib/preorder-utils";

export async function POST(request: Request) {
  try {
    const user = await requireUser(false);
    if (!user) {
      return NextResponse.json(
        { error: "Please log in to claim your Priority Pass", requireLogin: true },
        { status: 401 }
      );
    }

    const { preorderId } = await request.json();

    if (!preorderId) {
      return NextResponse.json({ error: "preorderId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch preorder & product
    const { data: preorder, error: preorderErr } = await supabase
      .from("preorders")
      .select("*, products(*)")
      .eq("id", preorderId)
      .eq("status", "ACTIVE")
      .maybeSingle();

    if (preorderErr || !preorder) {
      return NextResponse.json({ error: "Preorder campaign not found or inactive" }, { status: 404 });
    }

    // Check deadline
    const now = new Date();
    if (new Date(preorder.end_date) < now) {
      return NextResponse.json({ error: "This preorder campaign has ended" }, { status: 400 });
    }

    // Check slots
    if (preorder.max_quantity) {
      const { count } = await supabase
        .from("preorder_registrations")
        .select("id", { count: "exact", head: true })
        .eq("preorder_id", preorderId);
      if ((count || 0) >= preorder.max_quantity) {
        return NextResponse.json({ error: "All preorder slots are full" }, { status: 400 });
      }
    }

    // Check duplicate
    const { data: existing } = await supabase
      .from("preorder_registrations")
      .select("id, payment_status, reservation_fee_paid, granted_access")
      .eq("user_id", user.id)
      .eq("preorder_id", preorderId)
      .maybeSingle();

    if (existing) {
      if (existing.payment_status === "paid") {
        return NextResponse.json(
          { error: "You have already reserved a spot for this preorder", alreadyRegistered: true },
          { status: 409 }
        );
      }
    }

    const reservationFee = Number(preorder.reservation_fee || 0);
    if (reservationFee <= 0) {
      return NextResponse.json({ error: "Invalid reservation fee configured" }, { status: 400 });
    }

    // Create Razorpay order for the reservation fee
    const razorpayResult = await createRazorpayOrder(reservationFee, "INR");

    if (!razorpayResult.success || !razorpayResult.order) {
      return NextResponse.json(
        { error: razorpayResult.error || "Failed to create Razorpay order" },
        { status: 500 }
      );
    }

    const razorpayOrder = razorpayResult.order;

    // Resolve discount and locked price
    const { lockedPrice, discountPercentage: discountPct } = resolvePreorderPrice(preorder);

    // Upsert registration record in pending state with calculated locked price
    if (existing) {
      await supabase
        .from("preorder_registrations")
        .update({
          locked_price: lockedPrice,
          discount_percentage: discountPct,
          razorpay_order_id: razorpayOrder.id,
          payment_status: "pending",
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("preorder_registrations").insert({
        user_id: user.id,
        preorder_id: preorderId,
        product_id: preorder.product_id,
        discount_percentage: discountPct,
        locked_price: lockedPrice,
        reservation_fee_paid: 0,
        payment_status: "pending",
        razorpay_order_id: razorpayOrder.id,
        granted_access: false,
        status: "REGISTERED"
      });
    }

    return NextResponse.json({
      key: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      reservationFee,
      productName: preorder.products?.name,
      preorderTitle: preorder.title
    });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized", requireLogin: true }, { status: 401 });
    }
    console.error("Preorder reserve error:", err);
    return NextResponse.json({ error: err?.message || "Failed to create reservation" }, { status: 500 });
  }
}
