import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://archivevault.in";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/dashboard/",
        "/orders/",
        "/profile/",
        "/settings/",
        "/checkout/",
        "/wishlist/",
        "/addresses/",
        "/api/",
        "/forgot-password",
        "/login",
        "/register",
        "/reset-password",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
