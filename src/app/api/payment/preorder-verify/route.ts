import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyHmacSignature } from "@/lib/utils";
import { sendNotification } from "@/services/notifications";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verify Razorpay HMAC signature
    const payload = `${body.razorpay_order_id}|${body.razorpay_payment_id}`;
    const verified = verifyHmacSignature(
      payload,
      String(body.razorpay_signature ?? ""),
      process.env.RAZORPAY_KEY_SECRET ?? ""
    );

    if (!verified) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Find the matching registration by Razorpay order ID
    const { data: registration, error: regErr } = await supabase
      .from("preorder_registrations")
      .select("*, preorders(*, products(*))")
      .eq("razorpay_order_id", body.razorpay_order_id)
      .maybeSingle();

    if (regErr || !registration) {
      return NextResponse.json(
        { error: "Preorder registration not found for this payment" },
        { status: 404 }
      );
    }

    const reservationFee = Number(registration.preorders?.reservation_fee || 0);

    // Mark registration as paid
    const { error: updateErr } = await supabase
      .from("preorder_registrations")
      .update({
        payment_status: "paid",
        reservation_fee_paid: reservationFee,
        razorpay_payment_id: body.razorpay_payment_id,
        updated_at: new Date().toISOString()
      })
      .eq("id", registration.id);

    if (updateErr) {
      console.error("Failed to update preorder registration:", updateErr);
      return NextResponse.json({ error: "Failed to confirm reservation" }, { status: 500 });
    }

    // Notify customer
    try {
      const productName = registration.preorders?.products?.name || "a product";
      const preorderTitle = registration.preorders?.title || "Preorder";
      await sendNotification(
        registration.user_id,
        "preorder_payment",
        "Preorder Reservation Deposit Received",
        `Your reservation fee of ₹${reservationFee} for "${preorderTitle}" (${productName}) was received! We will notify you when admin grants production access.`
      );
    } catch (notifErr) {
      console.warn("Failed to send preorder notification:", notifErr);
    }

    return NextResponse.json({
      success: true,
      registrationId: registration.id,
      reservationFeePaid: reservationFee,
      message: "Reservation confirmed! We will notify you when your access is granted."
    });
  } catch (err: any) {
    console.error("Preorder verify error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to verify reservation payment" },
      { status: 500 }
    );
  }
}
