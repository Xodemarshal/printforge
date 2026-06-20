"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, requireUser } from "@/lib/guards";
import { ideaRequestSchema, stlSettingsSchema } from "@/lib/validators";
import { trackEvent } from "@/lib/utils";
import { estimatePrintPrice } from "@/lib/stl-utils";

const REQUEST_STATUSES = [
  "pending_review",
  "reviewing",
  "approved",
  "in_production",
  "completed",
  "rejected"
] as const;

function normalizeInstagramHandle(handle: string) {
  const value = handle.trim().replace(/\s+/g, "");
  return value.startsWith("@") ? value : `@${value.replace(/^@+/, "")}`;
}

function isSupportedImageFile(file: File) {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  return file.type.startsWith("image/") || [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(extension);
}

function sanitizePathSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function uploadSTLAction(formData: FormData) {
try {
console.log("=== STL UPLOAD START ===");

const user = await requireUser();
console.log("User:", user.id);

const parsed = ideaRequestSchema.safeParse({
  instagramHandle: formData.get("instagramHandle"),
  idea: formData.get("idea")
});

if (!parsed.success) {
  console.error("Validation failed:", parsed.error.flatten());

  return {
    error: JSON.stringify(parsed.error.flatten(), null, 2)
  };
}

const referenceImages = formData
  .getAll("referenceImages")
  .filter(
    (value): value is File =>
      value instanceof File && value.size > 0
  );

console.log(
  "Reference images:",
  referenceImages.map((f) => ({
    name: f.name,
    size: f.size,
    type: f.type
  }))
);

if (referenceImages.length === 0) {
  return { error: "Upload at least one inspiration image." };
}

const supabase = createAdminClient();
const bucket = supabase.storage.from("stl-uploads");

const uploadedImageUrls: string[] = [];
const normalizedHandle = normalizeInstagramHandle(
  parsed.data.instagramHandle
);

for (const [index, file] of referenceImages.entries()) {
  const path = [
    "idea-requests",
    sanitizePathSegment(user.id),
    `${Date.now()}-${index}-${sanitizePathSegment(file.name)}`
  ].join("/");

  console.log("Uploading:", path);

  const { data: uploadData, error: uploadError } =
    await bucket.upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false
    });

  if (uploadError) {
    console.error("Upload failed:", uploadError);

    return {
      error: `Storage upload failed: ${uploadError.message}`
    };
  }

  console.log("Upload success:", uploadData);

  const { data: publicUrl } = bucket.getPublicUrl(path);

  uploadedImageUrls.push(publicUrl.publicUrl);
}

console.log("Uploaded URLs:", uploadedImageUrls);

const coverImage = referenceImages[0];
const coverImageUrl = uploadedImageUrls[0] ?? "";

const { data, error } = await supabase
  .from("stl_uploads")
  .insert({
    user_id: user.id,
    instagram_handle: normalizedHandle,
    idea: parsed.data.idea,
    reference_images: uploadedImageUrls,
    file_name: coverImage.name,
    file_url: coverImageUrl,
    file_type: coverImage.type || "image/jpeg",
    file_size: coverImage.size,
    status: "pending_review",
    print_settings: {
      instagramHandle: normalizedHandle,
      idea: parsed.data.idea,
      referenceImages: uploadedImageUrls.length
    }
  })
  .select("*")
  .single();

if (error) {
  console.error("Database insert failed:", error);

  return {
    error: `Database error: ${error.message}`
  };
}

console.log("Database insert success:", data.id);

try {
  await trackEvent("idea_requested", user.id, {
    instagramHandle: normalizedHandle,
    referenceImageCount: uploadedImageUrls.length
  });
} catch (trackError) {
  console.error("trackEvent failed:", trackError);
}

revalidatePath("/admin/print-queue");
revalidatePath("/admin/dashboard");
revalidatePath("/dashboard");
revalidatePath("/settings");

console.log("=== STL UPLOAD SUCCESS ===");

return {
  success: true,
  request: data
};

} catch (err) {
console.error("FATAL ERROR:", err);

return {
  error:
    err instanceof Error
      ? `${err.message}\n\n${err.stack}`
      : JSON.stringify(err)
};

}
}
export async function submitIdeaRequestAction(_previousState: unknown, formData: FormData) {
  return uploadSTLAction(formData);
}

export async function updateIdeaRequestAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!REQUEST_STATUSES.includes(status as (typeof REQUEST_STATUSES)[number])) {
    return { error: "Invalid status." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("stl_uploads").update({ status }).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await trackEvent("admin_action", null, {
    action: "update_idea_request_status",
    id,
    status
  });

  revalidatePath("/admin/print-queue");
  revalidatePath("/admin/dashboard");

  return { success: true };
}

export async function createCustomPrintRequestAction(formData: FormData) {
  const user = await requireUser();
  const stlUploadId = String(formData.get("stlUploadId") ?? "");
  const material = String(formData.get("material") ?? "");
  const color = String(formData.get("color") ?? "");
  const layerHeight = Number(formData.get("layerHeight") ?? 0.2);
  const infill = Number(formData.get("infill") ?? 20);
  const quantity = Number(formData.get("quantity") ?? 1);
  const notes = String(formData.get("notes") ?? "");
  const estimatedHours = Number(formData.get("estimatedHours") ?? 0);

  const supabase = createAdminClient();
  const { data: stlUpload } = await supabase.from("stl_uploads").select("*").eq("id", stlUploadId).maybeSingle();
  if (!stlUpload) {
    return { error: "Upload not found." };
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      payment_status: "pending",
      total_amount: stlUpload.estimated_price ?? 0,
      notes
    })
    .select("*")
    .single();

  if (orderError) {
    return { error: orderError.message };
  }

  const { error: jobError } = await supabase.from("print_jobs").insert({
    stl_upload_id: stlUploadId,
    order_id: order.id,
    material,
    color,
    layer_height: layerHeight,
    infill,
    quantity,
    notes,
    estimated_hours: estimatedHours,
    status: "queued"
  });

  if (jobError) {
    return { error: jobError.message };
  }

  await supabase.from("stl_uploads").update({ status: "ordered" }).eq("id", stlUploadId);
  return { success: true, orderId: order.id };
}

export async function estimatePriceAction(formData: FormData) {
  const parsed = stlSettingsSchema.safeParse({
    material: formData.get("material"),
    color: formData.get("color") ?? "default",
    layerHeight: Number(formData.get("layerHeight") ?? 0.2),
    infill: Number(formData.get("infill") ?? 20),
    quantity: Number(formData.get("quantity") ?? 1),
    notes: formData.get("notes") ?? ""
  });

  if (!parsed.success) {
    return { error: "Invalid settings." };
  }

  return {
    success: true,
    price: estimatePrintPrice({
      material: parsed.data.material,
      layerHeight: parsed.data.layerHeight,
      infill: parsed.data.infill,
      quantity: parsed.data.quantity
    })
  };
}
