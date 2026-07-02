import type { Metadata } from "next";
import type React from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/hooks/useToast";
import { NotificationProvider } from "@/hooks/useNotifications";
import { CartProvider } from "@/hooks/useCart";
import { WishlistProvider } from "@/hooks/useWishlist";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { getSiteSettings } from "@/actions/settings";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSiteSettings();
    const faviconUrl = settings.faviconUrl || settings.logoUrl || "/design/logo.png";

    return {
      title: settings.siteName || "PrintForge",
      description: "Creative product storefront and admin platform.",
      icons: {
        icon: faviconUrl,
        shortcut: faviconUrl,
        apple: faviconUrl,
      },
    };
  } catch (error) {
    return {
      title: "PrintForge",
      description: "Creative product storefront and admin platform.",
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
      <body className="min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
