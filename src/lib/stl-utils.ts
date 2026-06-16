import { MATERIALS, SUPPORTED_UPLOAD_TYPES } from "@/lib/constants";

export function validateSTLFile(file: { name: string; size: number }) {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  const valid = SUPPORTED_UPLOAD_TYPES.includes(extension as (typeof SUPPORTED_UPLOAD_TYPES)[number]);
  return valid && file.size <= 50 * 1024 * 1024;
}

export function estimatePrintPrice(input: {
  material: string;
  layerHeight: number;
  infill: number;
  quantity: number;
  estimatedVolumeCm3?: number;
}) {
  const material = MATERIALS.find((item) => item.value === input.material) ?? MATERIALS[0];
  const volume = input.estimatedVolumeCm3 ?? 100;
  const complexityFactor = 1 + (1 - input.layerHeight) + input.infill / 100;
  return Number((volume * material.baseRate * complexityFactor * input.quantity).toFixed(2));
}
