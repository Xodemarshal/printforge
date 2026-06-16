"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/guards";
import { stlSettingsSchema } from "@/lib/validators";
import { trackEvent } from "@/lib/utils";
import { estimatePrintPrice, validateSTLFile } from "@/lib/stl-utils";

export async function uploadSTLAction(formData: FormData) {
  const user = await requireUser();
  const file = formData.get("file") as File | null;
  if (!file || !validateSTLFile(file)) {
    return { error: "Unsupported file type or file too large." };
  }

  const printSettings = stlSettingsSchema.safeParse({
    material: formData.get("material"),
    color: formData.get("color"),
    layerHeight: Number(formData.get("layerHeight") ?? 0.2),
    infill: Number(formData.get("infill") ?? 20),
    quantity: Number(formData.get("quantity") ?? 1),
    notes: formData.get("notes") ?? ""
  });

  if (!printSettings.success) {
    return { error: "Invalid print settings." };
  }

  const supabase = createAdminClient();
  const bucket = supabase.storage.from("stl-uploads");
  const path = `${user.id}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await bucket.upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false
  });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data: publicUrl } = bucket.getPublicUrl(path);
  const estimatedPrice = estimatePrintPrice({
    material: printSettings.data.material,
    layerHeight: printSettings.data.layerHeight,
    infill: printSettings.data.infill,
    quantity: printSettings.data.quantity
  });

  const { data, error } = await supabase
    .from("stl_uploads")
    .insert({
      user_id: user.id,
      file_name: file.name,
      file_url: publicUrl.publicUrl,
      file_type: file.type || "application/octet-stream",
      file_size: file.size,
      status: "uploaded",
      estimated_price: estimatedPrice,
      print_settings: printSettings.data
    })
    .select("*")
    .single();

  if (error) {
    return { error: error.message };
  }

  await trackEvent("stl_uploaded", user.id, {
    fileName: file.name,
    estimatedPrice
  });

  return {
    success: true,
    upload: data,
    fileUrl: publicUrl.publicUrl,
    estimatedPrice
  };
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
