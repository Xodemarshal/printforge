"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { addressSchema } from "@/lib/validators";
import { requireUser } from "@/lib/guards";
import { parseLoginInput, parseRegisterInput } from "@/lib/auth-actions";

type ActionResult = { success?: boolean; error?: string };

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = parseLoginInput(formData);
  if (!parsed.success) {
    console.log("Login validation failed:", parsed.error);
    return { error: "Invalid login details." };
  }

  console.log("Attempting to login user:", parsed.data.email);
  
  const supabase = createClient();
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

  const supabase = createClient();
  const admin = createAdminClient();
  
  console.log("Attempting to register user:", parsed.data.email);
  
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name
      }
    }
  });

  if (error) {
    console.log("Supabase auth signup error:", error);
    return { error: error.message };
  }

  console.log("User created:", data.user?.id);

  if (data.user) {
    const { error: dbError } = await admin.from("users").upsert({
      id: data.user.id,
      name: parsed.data.name,
      email: parsed.data.email,
      role: "customer"
    });
    
    if (dbError) {
      console.log("Database user creation error:", dbError);
      return { error: "Failed to create user profile." };
    }
  }

  console.log("Registration successful, redirecting to dashboard");
  revalidatePath("/");
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "");
  if (!email.includes("@")) {
    return { error: "Invalid email address." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password`
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

  const supabase = createAdminClient();
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

  const supabase = createAdminClient();
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

  const supabase = createAdminClient();
  const { error } = await supabase.from("addresses").update(parsed.data).eq("id", id).eq("user_id", user.id);
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

  const supabase = createAdminClient();
  const { error } = await supabase.from("addresses").delete().eq("id", id).eq("user_id", user.id);
  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
