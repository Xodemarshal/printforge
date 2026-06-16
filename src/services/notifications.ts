import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, notificationTemplate } from "@/lib/email";

export async function sendNotification(
  userId: string,
  type: string,
  title: string,
  body: string
) {
  const supabase = createAdminClient();
  const { data: user } = await supabase.from("users").select("email").eq("id", userId).maybeSingle();

  await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body,
    read: false
  });

  if (user?.email) {
    await sendEmail({
      to: user.email,
      subject: title,
      html: notificationTemplate(title, body)
    });
  }
}
