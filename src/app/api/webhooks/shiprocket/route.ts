import { NextResponse } from "next/server";
import { applyShiprocketWebhook } from "@/services/shiprocket";
import { revalidatePath } from "next/cache";

function isWebhookAuthorized(request: Request) {
  const secret = process.env.SHIPROCKET_WEBHOOK_SECRET;
  if (!secret) {
    return true;
  }

  const headerSecret = request.headers.get("x-shiprocket-webhook-secret")
    || request.headers.get("x-webhook-secret")
    || request.headers.get("x-shipping-webhook-secret");
  const urlSecret = new URL(request.url).searchParams.get("secret");

  return headerSecret === secret || urlSecret === secret;
}

export async function POST(request: Request) {
  try {
    if (!isWebhookAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const result = await applyShiprocketWebhook(payload);

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${result.orderId}`);
    revalidatePath("/orders");
    revalidatePath(`/orders/${result.orderId}`);
    revalidatePath("/admin/shipping/not-picked-up");

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
