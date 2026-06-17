"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/guards";

export async function getUserNotifications() {
  const user = await requireUser();
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  
  if (error) throw error;
  return data ?? [];
}

export async function markNotificationAsRead(id: string) {
  const user = await requireUser();
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("user_id", user.id);
  
  if (error) throw error;
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const user = await requireUser();
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);
  
  if (error) throw error;
  return { success: true };
}
