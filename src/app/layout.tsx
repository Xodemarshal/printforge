import type { Metadata } from "next";
import type React from "react";
import "./globals.css";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/hooks/useToast";
import { NotificationProvider } from "@/hooks/useNotifications";
import { CartProvider } from "@/hooks/useCart";
import { WishlistProvider } from "@/hooks/useWishlist";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { getSiteSettings } from "@/actions/settings";

export async function generateMetadata(): Promise<Metadata> {
  const siteDescription =
    "Shop premium 3D printed toys, collectibles, décor, desk accessories, gifts and custom creations from Crafted Tale.";
  const siteUrl = "https://craftedtale.in";

  try {
    const settings = await getSiteSettings();
    const faviconUrl = settings.faviconUrl || settings.logoUrl || "/design/logo.png";
    const siteName = settings.siteName || "Crafted Tale";

    return {
      metadataBase: new URL(siteUrl),
      title: {
        default: `${siteName} | Premium 3D Printed Toys, Collectibles & Décor`,
        template: `%s | ${siteName}`,
      },
      description: siteDescription,
      alternates: {
        canonical: siteUrl,
      },
      openGraph: {
        title: siteName,
        description: siteDescription,
        url: siteUrl,
        siteName: siteName,
        locale: "en_IN",
        type: "website",
        images: [
          {
            url: "/design/logo.png",
            width: 1200,
            height: 630,
            alt: siteName,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: siteName,
        description: siteDescription,
        images: ["/design/logo.png"],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      icons: {
        icon: faviconUrl,
        shortcut: faviconUrl,
        apple: faviconUrl,
      },
    };
  } catch (error) {
    return {
      metadataBase: new URL(siteUrl),
      title: {
        default: "Crafted Tale | Premium 3D Printed Toys, Collectibles & Décor",
        template: "%s | Crafted Tale",
      },
      description: siteDescription,
      alternates: {
        canonical: siteUrl,
      },
      openGraph: {
        title: "Crafted Tale",
        description: siteDescription,
        url: siteUrl,
        siteName: "Crafted Tale",
        locale: "en_IN",
        type: "website",
        images: [
          {
            url: "/design/logo.png",
            width: 1200,
            height: 630,
            alt: "Crafted Tale",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Crafted Tale",
        description: siteDescription,
        images: ["/design/logo.png"],
      },
      robots: {
        index: true,
        follow: true,
      },
      icons: {
        icon: "/design/logo.png",
        shortcut: "/design/logo.png",
        apple: "/design/logo.png",
      },
    };
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ToastProvider>
            <NotificationProvider>
              <WishlistProvider>
                <CartProvider>
                  {children}
                  <CartDrawer />
                </CartProvider>
              </WishlistProvider>
            </NotificationProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
