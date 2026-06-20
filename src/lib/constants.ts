import type { Material } from "@/types";
import { ORDER_STATUSES } from "@/types";

export { ORDER_STATUSES };

export const SUPPORTED_UPLOAD_TYPES = [".stl", ".obj", ".3mf"] as const;
export const SUPPORTED_IMAGE_TYPES = [".png", ".jpg", ".jpeg", ".webp", ".gif"] as const;
export const PAGE_SIZE = 12;

export const MATERIALS: { value: Material; label: string; density: number; baseRate: number }[] = [
  { value: "PLA", label: "PLA", density: 1.24, baseRate: 1.5 },
  { value: "PETG", label: "PETG", density: 1.27, baseRate: 1.8 },
  { value: "Resin", label: "Resin", density: 1.1, baseRate: 2.4 },
  { value: "Packaging", label: "Packaging", density: 0.4, baseRate: 0.5 },
  { value: "LEDs", label: "LEDs", density: 0.8, baseRate: 3.1 },
  { value: "Electronics", label: "Electronics", density: 1.0, baseRate: 4.5 }
];

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Collections" },
  { href: "/best-sellers", label: "Best Sellers" },
  { href: "/upload-stl", label: "Special Item" },
  { href: "/new-arrivals", label: "New Arrivals" }
];

export const ADMIN_NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/print-queue", label: "Requests" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/shipping/not-picked-up", label: "Shipping" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" }
];

export const SHIPROCKET_TRACKING_STAGES = [
  "not_generated",
  "label_generated",
  "manifested",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered"
] as const;

export const CUSTOMER_NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/orders", label: "My Orders" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/addresses", label: "Addresses" },
  { href: "/checkout", label: "Checkout" }
];
