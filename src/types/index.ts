export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "printing",
  "shipped",
  "delivered",
  "cancelled",
  "rejected"
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type AnalyticsEventType =
  | "search_performed"
  | "product_viewed"
  | "stl_uploaded"
  | "add_to_cart"
  | "checkout_started"
  | "order_completed"
  | "review_submitted"
  | "wishlist_toggled"
  | "admin_action";

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
};

export type Material = "PLA" | "PETG" | "Resin" | "Packaging" | "LEDs" | "Electronics";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  avatar_url?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  category_id?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  model_url?: string | null;
  material_info?: string | null;
  color_options: string[];
  specifications: Json;
  rating: number;
  review_count: number;
  featured: boolean;
  best_seller: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type OrderRow = {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  discount_amount: number;
  shipping_address_id?: string | null;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type InventoryRow = {
  id: string;
  material: Material;
  quantity: number;
  threshold: number;
  unit: string;
  updated_at: string;
};

export type STLUploadRow = {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  status: "pending" | "uploaded" | "failed" | "quoted" | "converted" | "ordered";
  estimated_price?: number | null;
  print_settings: Json;
  created_at: string;
  updated_at: string;
};

export type PrintJobRow = {
  id: string;
  stl_upload_id: string;
  order_id?: string | null;
  material: Material;
  color: string;
  layer_height: number;
  infill: number;
  quantity: number;
  notes?: string | null;
  estimated_hours?: number | null;
  assigned_printer?: string | null;
  status: "queued" | "printing" | "paused" | "completed" | "rejected";
  created_at: string;
  updated_at: string;
};
