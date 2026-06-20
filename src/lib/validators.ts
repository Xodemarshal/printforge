import { z } from "zod";
import { MATERIALS } from "@/lib/constants";
import type { Material } from "@/types";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export const productSearchSchema = z.object({
  query: z.string().optional().default(""),
  category: z.string().optional(),
  page: z.number().int().positive().optional().default(1)
});

export const stlSettingsSchema = z.object({
  material: z.enum(MATERIALS.map((item) => item.value) as [Material, ...Material[]]),
  color: z.string().min(1),
  layerHeight: z.number().min(0.05).max(1),
  infill: z.number().min(0).max(100),
  quantity: z.number().int().positive(),
  notes: z.string().optional().default("")
});

export const ideaRequestSchema = z.object({
  instagramHandle: z.string().trim().min(2).max(80),
  idea: z.string().trim().min(20).max(2000)
});

export const couponSchema = z.object({
  code: z.string().min(2),
  total: z.number().nonnegative()
});

export const orderStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.string().min(2)
});

export const addressSchema = z.object({
  id: z.string().uuid().optional(),
  line1: z.string().min(2),
  line2: z.string().optional().default(""),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4),
  country: z.string().min(2)
});

export const shiprocketShippingSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(8),
  line1: z.string().min(2),
  line2: z.string().optional().default(""),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().regex(/^\d{6}$/, "Enter a 6 digit pincode"),
  country: z.string().min(2).default("IN")
});

export const reviewSchema = z.object({
  orderItemId: z.string().uuid(),
  productId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1)
});
