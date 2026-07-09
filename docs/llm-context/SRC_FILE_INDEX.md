# Src File Index

This file gives a one-line purpose note for every file under `src/`.

## Root And Infrastructure

- `src/middleware.ts` - Route protection and request middleware for auth/admin access control.
- `src/app/layout.tsx` - Root app layout that wires shared providers and global metadata.
- `src/app/globals.css` - Global styles, tokens, and base visual system.
- `src/components/theme-provider.tsx` - Theme provider wrapper for light/dark mode behavior.

## Types

- `src/types/index.ts` - Shared database row types, order models, analytics enums, and cart/product interfaces.
- `src/types/shipping.ts` - Shipping mode, shipment status, provider contracts, and shipping-specific order extensions.

## Lib: Supabase

- `src/lib/supabase/server.ts` - Server-side Supabase client for request-scoped access.
- `src/lib/supabase/client.ts` - Browser Supabase client for client-side interactions.
- `src/lib/supabase/admin.ts` - Admin Supabase client used for privileged server operations.

## Lib: Shipping

- `src/lib/shipping/provider.ts` - Resolves global shipping mode and selects the correct provider implementation.
- `src/lib/shipping/manual.ts` - Manual shipping provider implementation for non-Shiprocket fulfillment.
- `src/lib/shipping/shiprocket.ts` - Shiprocket provider implementation for automatic shipping workflows.
- `src/lib/shipping/utils.ts` - Shipping helper utilities for eligibility, status flow, formatting, and display logic.

## Lib: Core Utilities

- `src/lib/utils.ts` - Shared utility helpers used across the app.
- `src/lib/validators.ts` - Zod schemas and validation helpers for forms and payloads.
- `src/lib/guards.ts` - Auth and role guard helpers for server actions and routes.
- `src/lib/route-guards.ts` - Route-level guard helpers for protected pages and API endpoints.
- `src/lib/razorpay.ts` - Razorpay client setup and payment helpers.
- `src/lib/email.ts` - Email helper utilities and templates.
- `src/lib/design.ts` - Design tokens and presentation helpers.
- `src/lib/constants.ts` - App-wide constants and shared literal values.
- `src/lib/product-filters.ts` - Product filtering and search helpers.
- `src/lib/stl-utils.ts` - STL file and model handling utilities.
- `src/lib/auth-actions.ts` - Auth-specific action helpers and wrappers.
- `src/lib/mock-supabase.ts` - Mock Supabase implementation for tests and local fallback scenarios.

## Services: Commerce And Shipping

- `src/services/shiprocket.ts` - Shiprocket API integration, payload building, sync, tracking, webhook mapping, and retry handling.
- `src/services/customer.ts` - Customer linkage, aggregation, and profile-related service logic.
- `src/services/cart.ts` - Cart persistence, recovery, and abandonment-related service logic.
- `src/services/email.ts` - Email sending and template orchestration.
- `src/services/notifications.ts` - In-app notification creation and delivery helpers.
- `src/services/analytics.ts` - Event tracking and analytics service layer.
- `src/services/orders.ts` does not exist; order logic lives in actions and shipping services.
- `src/services/reviews.ts` - Review-related service logic and moderation helpers.
- `src/services/reports.ts` - Reporting data assembly for admin dashboards.
- `src/services/profitability.ts` - Profit and cost calculation utilities for orders and products.
- `src/services/printFarm.ts` - Print farm workflow service helpers.
- `src/services/businessHealth.ts` - Business health metrics and operational scoring.
- `src/services/alerts.ts` - Alert generation and alerting logic for admin workflows.
- `src/services/adminActivity.ts` - Admin activity logging and audit trail helpers.

## Services: Domain Features

- `src/services/reviews.ts` - Review lifecycle support and data shaping.
- `src/services/reports.ts` - Data pipelines for performance and sales reports.
- `src/services/profitability.ts` - Margin and cost analytics for orders.
- `src/services/printFarm.ts` - Production queue and print-farm support logic.
- `src/services/businessHealth.ts` - KPI and health-score calculations.
- `src/services/alerts.ts` - Operational alert generation.
- `src/services/adminActivity.ts` - Activity log capture for admin actions.

## Actions: Auth And Account

- `src/actions/auth.ts` - Authentication flows, user creation, password reset, and session actions.
- `src/actions/notifications.ts` - Notification read/update actions for the UI.
- `src/actions/wishlist.ts` - Wishlist add/remove/toggle actions.
- `src/actions/coupons.ts` - Coupon validation and redemption actions.
- `src/actions/domains.ts` - Domain-related admin actions and configuration helpers.

## Actions: Product And Catalog

- `src/actions/products.ts` - Product CRUD and catalog management actions.
- `src/actions/productReviews.ts` - Product review moderation and retrieval actions.
- `src/actions/reviews.ts` - Customer review actions and moderation hooks.
- `src/actions/inventory.ts` - Inventory updates and stock control actions.

## Actions: Commerce

- `src/actions/cart.ts` does not exist; cart behavior is handled by `src/hooks/useCart.tsx` and `src/services/cart.ts`.
- `src/actions/checkout.ts` - Checkout order creation, payment verification, and post-payment sync logic.
- `src/actions/orders.ts` - Order management actions for admin and customer order flows.
- `src/actions/shipping.ts` - Shipping mode, shipment creation, and manual shipment update actions.
- `src/actions/settings.ts` - Site settings read/write actions, including shipping mode in `site_settings`.
- `src/actions/printFarm.ts` - Print farm action layer and production queue actions.
- `src/actions/profitability.ts` - Profitability calculation actions for dashboards and summaries.
- `src/actions/businessHealth.ts` - Business health action layer for admin dashboards.
- `src/actions/analytics.ts` - Analytics event actions and admin analytics helpers.
- `src/actions/adminAlerts.ts` - Admin alert actions for alert center workflows.
- `src/actions/adminActivity.ts` - Admin activity log actions and audit capture.
- `src/actions/reports.ts` - Report generation actions for admin reporting views.

## Actions: STL And Production

- `src/actions/stl.ts` - STL upload, validation, and workflow actions for custom design submissions.

## App API Routes: Payments

- `src/app/api/payment/create-order/route.ts` - Creates Razorpay orders and inserts the matching DB order row.
- `src/app/api/payment/verify/route.ts` - Verifies payment signatures, marks orders paid, and conditionally syncs shipping.

## App API Routes: Webhooks

- `src/app/api/webhooks/razorpay/route.ts` - Records incoming Razorpay webhook events for later processing.
- `src/app/api/webhooks/shiprocket/route.ts` - Applies Shiprocket webhook updates to orders and revalidates shipping views.

## App API Routes: Cron

- `src/app/api/cron/hourly-tasks/route.ts` - Hourly background jobs and maintenance tasks.
- `src/app/api/cron/daily-report/route.ts` - Daily report generation endpoint.
- `src/app/api/cron/weekly-report/route.ts` - Weekly report generation endpoint.
- `src/app/api/cron/abandoned-carts/route.ts` - Abandoned cart scanning and recovery workflow.

## App API Routes: Notifications And Auth

- `src/app/api/notifications/route.ts` - Notification API endpoint for client-side fetches.
- `src/app/api/auth/callback/route.ts` - Auth callback handling for login and provider redirects.
- `src/app/api/make-admin/route.ts` - Admin promotion endpoint for privileged role assignment.
- `src/app/api/user/addresses/route.ts` - User address fetch/update endpoint for checkout and profile flows.
- `src/app/api/analytics/route.ts` - Analytics event collection endpoint.

## Hooks

- `src/hooks/useCart.tsx` - Cart state, item management, and derived totals in the client.
- `src/hooks/useWishlist.tsx` - Wishlist state and toggle logic in the client.
- `src/hooks/useToast.tsx` - Toast notification hook used across UI components.
- `src/hooks/useNotifications.tsx` - Notification polling and client state hook.

## Components: Layout

- `src/components/layout/Header.tsx` - Public site header and navigation.
- `src/components/layout/Footer.tsx` - Public site footer and links.
- `src/components/layout/AdminSidebar.tsx` - Admin navigation sidebar.
- `src/components/layout/NotificationBell.tsx` - Notification indicator in the header.
- `src/components/layout/ThemeToggle.tsx` - UI control for switching theme.

## Components: UI

- `src/components/ui/Button.tsx` - Base button component.
- `src/components/ui/Input.tsx` - Base text input component.
- `src/components/ui/Textarea.tsx` - Base textarea component.
- `src/components/ui/Select.tsx` - Base select component.
- `src/components/ui/Switch.tsx` - Toggle/switch control.
- `src/components/ui/Badge.tsx` - Status badge component.
- `src/components/ui/Card.tsx` - Card wrapper component.
- `src/components/ui/Separator.tsx` - Horizontal separator component.
- `src/components/ui/Toast.tsx` - Toast rendering component.

## Components: Home

- `src/components/home/HeroBanner.tsx` - Homepage hero section.
- `src/components/home/FeaturedProducts.tsx` - Featured products carousel/grid.
- `src/components/home/BestSellers.tsx` - Best-selling products section.
- `src/components/home/TrendingProducts.tsx` - Trending products section.
- `src/components/home/CategoryGrid.tsx` - Category tiles/grid.
- `src/components/home/CustomerReviews.tsx` - Homepage review/testimonial section.
- `src/components/home/FAQSection.tsx` - Homepage FAQ section.
- `src/components/home/TrustBar.tsx` - Trust badges and confidence strip.
- `src/components/home/UploadCTA.tsx` - Call-to-action for STL/design uploads.

## Components: Products

- `src/components/products/ProductCard.tsx` - Single product tile/card UI.
- `src/components/products/ProductGrid.tsx` - Product listing grid.
- `src/components/products/AddToCartButton.tsx` - Add-to-cart action button.
- `src/components/products/WishlistToggleButton.tsx` - Wishlist toggle button for a product.
- `src/components/products/ListingPageClient.tsx` - Client-side product listing page logic.
- `src/components/products/CollectionsPageClient.tsx` - Collections browsing page logic.

## Components: Cart And Checkout

- `src/components/cart/CartDrawer.tsx` - Slide-out cart drawer and cart summary.
- `src/app/(customer)/checkout/CheckoutClient.tsx` - Full checkout flow and Razorpay orchestration.

## Components: Orders

- `src/components/orders/OrderTimeline.tsx` - Order status timeline UI.
- `src/components/orders/ReviewSection.tsx` - Product/order review section.

## Components: Shipping

- `src/components/shipping/AdminShippingPanel.tsx` - Admin shipping control panel for an order.
- `src/components/shipping/CustomerTrackingPanel.tsx` - Customer-facing shipping status and tracking panel.
- `src/components/shipping/ShipmentTimeline.tsx` - Shipment event timeline UI.

## Components: Admin

- `src/components/admin/AdminDataTable.tsx` - Generic admin table component.
- `src/components/admin/AnalyticsCharts.tsx` - Analytics chart visualizations.
- `src/components/admin/DeleteProductButton.tsx` - Product deletion action button.
- `src/components/admin/NotPickedUpOrdersClient.tsx` - Dashboard for Shiprocket orders not yet picked up.

## Components: STL And Utilities

- `src/components/stl/STLViewer.tsx` - STL viewer for 3D model previews.
- `src/components/whatsapp/WhatsAppFloatingButton.tsx` - Floating WhatsApp contact button.
- `src/components/whatsapp/WhatsAppContactButton.tsx` - Inline WhatsApp contact button.

## App: Auth Pages

- `src/app/(auth)/login/page.tsx` - Login page.
- `src/app/(auth)/register/page.tsx` - Registration page.
- `src/app/(auth)/forgot-password/page.tsx` - Forgot-password request page.
- `src/app/(auth)/reset-password/page.tsx` - Password reset page.

## App: Customer Pages

- `src/app/(customer)/layout.tsx` - Customer area layout.
- `src/app/(customer)/dashboard/page.tsx` - Customer dashboard page.
- `src/app/(customer)/dashboard/DashboardClient.tsx` - Client logic for the customer dashboard.
- `src/app/(customer)/wishlist/page.tsx` - Wishlist page.
- `src/app/(customer)/wishlist/WishlistClient.tsx` - Wishlist page client logic.
- `src/app/(customer)/addresses/page.tsx` - Saved addresses page.
- `src/app/(customer)/checkout/page.tsx` - Checkout route wrapper page.
- `src/app/(customer)/profile/page.tsx` - Customer profile page.
- `src/app/(customer)/settings/page.tsx` - Customer settings page.
- `src/app/(customer)/orders/page.tsx` - Customer orders list page.
- `src/app/(customer)/orders/[id]/page.tsx` - Customer order detail page.

## App: Public Pages

- `src/app/(public)/layout.tsx` - Public site layout.
- `src/app/(public)/page.tsx` - Home page.
- `src/app/(public)/about/page.tsx` - About page.
- `src/app/(public)/contact/page.tsx` - Contact page.
- `src/app/(public)/faq/page.tsx` - FAQ page.
- `src/app/(public)/shop/page.tsx` - Shop listing page.
- `src/app/(public)/best-sellers/page.tsx` - Best sellers page.
- `src/app/(public)/new-arrivals/page.tsx` - New arrivals page.
- `src/app/(public)/make-admin/page.tsx` - Public admin-promotion utility page.
- `src/app/(public)/categories/[slug]/page.tsx` - Category detail listing page.
- `src/app/(public)/products/[slug]/page.tsx` - Product detail route wrapper.
- `src/app/(public)/products/[slug]/ProductDetailClient.tsx` - Product detail page client logic.
- `src/app/(public)/products/[slug]/ProductDetailClientNew.tsx` - Alternate/new product detail client variant.
- `src/app/(public)/upload-design/page.tsx` - Upload design page.
- `src/app/(public)/upload-design/UploadDesignClient.tsx` - Upload design client logic.
- `src/app/(public)/upload-stl/page.tsx` - STL upload page.
- `src/app/(public)/upload-stl/IdeaRequestForm.tsx` - Idea request form for STL/design submission.

## App: Admin Pages

- `src/app/(admin)/layout.tsx` - Admin area layout and shared shell.
- `src/app/(admin)/admin/dashboard/page.tsx` - Admin dashboard landing page.
- `src/app/(admin)/admin/activity-log/page.tsx` - Admin activity log page.
- `src/app/(admin)/admin/activity-log/ActivityLogDashboard.tsx` - Activity log dashboard client.
- `src/app/(admin)/admin/analytics/page.tsx` - Analytics dashboard page.
- `src/app/(admin)/admin/analytics/AnalyticsDashboard.tsx` - Analytics dashboard client.
- `src/app/(admin)/admin/alerts/page.tsx` - Alert center page.
- `src/app/(admin)/admin/alerts/AlertCenterDashboard.tsx` - Alert center dashboard client.
- `src/app/(admin)/admin/categories/page.tsx` - Admin categories page.
- `src/app/(admin)/admin/categories/AdminCategoriesClient.tsx` - Categories management client.
- `src/app/(admin)/admin/coupons/page.tsx` - Coupon management page.
- `src/app/(admin)/admin/health/page.tsx` - Business health page.
- `src/app/(admin)/admin/health/BusinessHealthDashboard.tsx` - Business health dashboard client.
- `src/app/(admin)/admin/inventory/page.tsx` - Inventory management page.
- `src/app/(admin)/admin/inventory/InventoryDashboard.tsx` - Inventory dashboard client.
- `src/app/(admin)/admin/leads/page.tsx` - Lead management page.
- `src/app/(admin)/admin/leads/LeadsDashboard.tsx` - Leads dashboard client.
- `src/app/(admin)/admin/orders/page.tsx` - Orders list/admin orders page.
- `src/app/(admin)/admin/orders/[id]/page.tsx` - Order detail admin page.
- `src/app/(admin)/admin/print-farm/page.tsx` - Print farm page.
- `src/app/(admin)/admin/print-farm/PrintFarmDashboard.tsx` - Print farm dashboard client.
- `src/app/(admin)/admin/print-queue/page.tsx` - Print queue page.
- `src/app/(admin)/admin/product-reviews/page.tsx` - Product reviews admin page.
- `src/app/(admin)/admin/product-reviews/ProductReviewsDashboard.tsx` - Product reviews dashboard client.
- `src/app/(admin)/admin/products/page.tsx` - Products admin page.
- `src/app/(admin)/admin/products/new/page.tsx` - New product page.
- `src/app/(admin)/admin/products/new/NewProductClient.tsx` - New product form client.
- `src/app/(admin)/admin/products/edit/[id]/page.tsx` - Edit product page.
- `src/app/(admin)/admin/products/edit/[id]/EditProductForm.tsx` - Edit product form client.
- `src/app/(admin)/admin/products/bulk-upload/page.tsx` - Bulk upload page for products.
- `src/app/(admin)/admin/products/bulk-upload/bulkUploadForm.tsx` - Bulk upload form client.
- `src/app/(admin)/admin/profitability/page.tsx` - Profitability page.
- `src/app/(admin)/admin/profitability/ProfitabilityDashboard.tsx` - Profitability dashboard client.
- `src/app/(admin)/admin/reports/page.tsx` - Reports page.
- `src/app/(admin)/admin/reports/ReportsDashboard.tsx` - Reports dashboard client.
- `src/app/(admin)/admin/settings/page.tsx` - Admin settings page.
- `src/app/(admin)/admin/settings/SettingsForm.tsx` - Full site settings form including shipping mode.
- `src/app/(admin)/admin/shipping/not-picked-up/page.tsx` - Shipping queue page for not-picked-up Shiprocket orders.

## App: Miscellaneous

- `src/app/(admin)/admin/health/page.tsx` - Admin health route wrapper.
- `src/app/(admin)/admin/orders/page.tsx` - Admin orders overview and filters.
- `src/app/(admin)/admin/product-reviews/page.tsx` - Admin review management route wrapper.

## Notes

- If you add a new file under `src/`, append it here with a one-line purpose note.
- If a file changes ownership, update this index so future edits know where the logic lives.


To continue this session, run codex resume 019f489e-1089-7820-a97a-aa4a17cd8329