"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { addressSchema } from "@/lib/validators";
import { requireUser } from "@/lib/guards";
import { parseLoginInput, parseRegisterInput } from "@/lib/auth-actions";
import { sendEmail } from "@/services/email";
import { sendNotification } from "@/services/notifications";
import { trackEvent } from "@/lib/utils";

type ActionResult = { success?: boolean; error?: string };

/**
 * Helper to securely resolve the application base URL from environment variables or async headers.
 */
async function getAppUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  const fallbackHost = "localhost:3000";
  const requestHeaders = await headers();
  // Server actions can execute behind reverse proxies; evaluate forwarded hosts first
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || fallbackHost;
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";

  return `${protocol}://${host}`;
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = parseLoginInput(formData);
  if (!parsed.success) {
    console.log("Login validation failed:", parsed.error);
    return { error: "Invalid login details." };
  }

  console.log("Attempting to login user:", parsed.data.email);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    console.log("Supabase auth login error:", error);
    return { error: error.message };
  }

  console.log("Login successful:", data.user?.id);
  revalidatePath("/");
  redirect("/dashboard");
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const parsed = parseRegisterInput(formData);
  if (!parsed.success) {
    console.log("Registration validation failed:", parsed.error);
    return { error: "Invalid registration details." };
  }

  const supabase = await createClient();
  const admin = await createAdminClient();

  console.log("Attempting to register user:", parsed.data.email);

  const appUrl = await getAppUrl();
  let confirmLink = "";
  let userId = "";

  const adminClient = admin as any;
  if (adminClient.auth?.admin) {
    // Generate the signup verification link using the Supabase Service Role client to bypass default mailer limits
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "signup",
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        redirectTo: `${appUrl}/api/auth/callback`,
        data: {
          name: parsed.data.name
        }
      }
    });

    if (linkError) {
      console.log("Supabase auth generateLink error:", linkError);
      return { error: linkError.message };
    }

    confirmLink = linkData?.data?.properties?.action_link || linkData?.properties?.action_link || "";
    userId = linkData?.data?.user?.id || linkData?.user?.id || "";
  } else {
    // Fallback for Mock client during build or testing
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${appUrl}/api/auth/callback`,
        data: {
          name: parsed.data.name
        }
      }
    });

    if (signUpError) {
      console.log("Supabase auth signup error:", signUpError);
      return { error: signUpError.message };
    }

    userId = signUpData.user?.id || `mock-user-${Date.now()}`;
    confirmLink = `${appUrl}/api/auth/callback?code=mock-code`;
  }

  if (userId) {
    const { error: dbError } = await admin.from("users").upsert({
      id: userId,
      name: parsed.data.name,
      email: parsed.data.email,
      role: "customer"
    });

    if (dbError) {
      console.log("Database user creation error:", dbError);
      return { error: "Failed to create user profile." };
    }
  }

  // Send signup verification email using Resend
  if (confirmLink) {
    const { error: emailError } = await sendEmail("signup_confirmation", {
      to: parsed.data.email,
      subject: "Confirm your PrintForge Account",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1d6c1; border-radius: 12px; background-color: #FAF6EE;">
          <h2 style="color: #2D5016; text-align: center;">Welcome to PrintForge!</h2>
          <p>Hi ${parsed.data.name},</p>
          <p>Thank you for signing up. Please click the button below to verify your email address and activate your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmLink}" style="background-color: #2D5016; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Verify Email Address</a>
          </div>
          <p style="color: #6B7280; font-size: 12px; text-align: center;">
            If the button doesn't work, copy and paste the link below into your browser:
            <br/>
            <a href="${confirmLink}" style="color: #D4A017;">${confirmLink}</a>
          </p>
        </div>
      `
    });

    if (emailError) {
      console.log("Resend signup email error:", emailError);
      return { error: "Failed to send confirmation email. Please verify your email address is correct." };
    }
  }

  console.log("Registration successful, redirecting to login with confirmation request");
  revalidatePath("/");
  redirect("/login?message=check-email");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "");
  if (!email.includes("@")) {
    return { error: "Invalid email address." };
  }

  const supabase = await createClient();
  const appUrl = await getAppUrl();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/reset-password`
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const avatar_url = String(formData.get("avatar_url") ?? "");

  const supabase = await createAdminClient();
  const { error } = await supabase.from("users").update({
    name,
    phone,
    avatar_url
  }).eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function addAddressAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = addressSchema.safeParse({
    line1: String(formData.get("line1") ?? ""),
    line2: String(formData.get("line2") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    postalCode: String(formData.get("postalCode") ?? ""),
    country: String(formData.get("country") ?? "")
  });

  if (!parsed.success) {
    return { error: "Invalid address." };
  }

  const supabase = await createAdminClient();
  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    ...parsed.data,
    is_default: false
  });
  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updateAddressAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  const parsed = addressSchema.safeParse({
    id,
    line1: String(formData.get("line1") ?? ""),
    line2: String(formData.get("line2") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    postalCode: String(formData.get("postalCode") ?? ""),
    country: String(formData.get("country") ?? "")
  });

  if (!parsed.success || !id) {
    return { error: "Invalid address." };
  }

  // Deconstruct 'id' out of payload to avoid mutation errors during database update calls
  const { id: _, ...updateData } = parsed.data as any;

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("addresses")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function deleteAddressAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Invalid address." };
  }

  const supabase = await createAdminClient();
  const { error } = await supabase.from("addresses").delete().eq("id", id).eq("user_id", user.id);
  if (error) {
    return { error: error.message };
  }

  return { success: true };
}/**
 * Change user password
 */
export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (newPassword.length < 6) {
      return { error: "New password must be at least 6 characters" };
    }

    if (newPassword !== confirmPassword) {
      return { error: "New passwords do not match" };
    }

    const supabase = await createClient();

    // First verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email || "",
      password: currentPassword
    });

    if (signInError) {
      return { error: "Current password is incorrect" };
    }

    // Update password
    const { error: updateError } = await (supabase.auth as any).updateUser({
      password: newPassword
    });

    if (updateError) {
      return { error: updateError.message };
    }

    await sendNotification(
      user.id,
      "account_update",
      "Password Changed",
      "Your password has been updated successfully."
    );

    await trackEvent("admin_action", user.id, {
      action: "password_change"
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to change password" };
  }
}

/**
 * Send password reset email
 */
export async function requestPasswordResetAction(formData: FormData): Promise<ActionResult> {
  try {
    const email = String(formData.get("email") ?? "");

    if (!email.includes("@")) {
      return { error: "Please enter a valid email address" };
    }

    const supabase = await createClient();
    const appUrl = await getAppUrl();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/reset-password`
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to send reset email" };
  }
}

/**
 * Reset password with token
 */
export async function resetPasswordWithTokenAction(formData: FormData): Promise<ActionResult> {
  try {
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password.length < 6) {
      return { error: "Password must be at least 6 characters" };
    }

    if (password !== confirmPassword) {
      return { error: "Passwords do not match" };
    }

    const supabase = await createClient();
    const { error } = await (supabase.auth as any).updateUser({
      password
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to reset password" };
  }
}
