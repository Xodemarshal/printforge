import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({
    notifications: data ?? [],
    unreadCount: (data ?? []).filter((item: any) => !item.read).length
  });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const admin = createAdminClient();
  if (body.id) {
    await admin.from("notifications").update({ read: true }).eq("id", body.id).eq("user_id", user.id);
  } else {
    await admin.from("notifications").update({ read: true }).eq("user_id", user.id);
  }

  return NextResponse.json({ success: true });
}
