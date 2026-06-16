import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.type) {
      return NextResponse.json({ error: "Missing event type" }, { status: 400 });
    }

    await trackEvent(body.type, body.userId ?? null, body.metadata ?? {});
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
