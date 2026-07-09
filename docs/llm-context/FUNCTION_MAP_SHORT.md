# PrintForge Function Map

## Settings

- `getSiteSettings()` in `src/actions/settings.ts`: loads `site_settings` JSON and returns site name, logo, favicon, shipping mode, and hero content.
- `updateSiteSettingsAction()` in `src/actions/settings.ts`: writes the full `site_settings` JSON back to `public.settings`.
- `getGlobalShippingMode()` in `src/lib/shipping/provider.ts`: reads `site_settings.shippingMode`, defaults to `AUTOMATIC`.
- `updateGlobalShippingMode()` in `src/lib/shipping/provider.ts`: updates only the shipping mode inside `site_settings`.

## Checkout And Payment

- `createOrderAction()` in `src/actions/checkout.ts`: creates the order, address, order items, Razorpay order, and stores shipping mode/provider.
- `verifyPaymentAction()` in `src/actions/checkout.ts`: marks the order paid and syncs Shiprocket only for automatic mode.
- `POST /api/payment/create-order` in `src/app/api/payment/create-order/route.ts`: lightweight API version of order creation.
- `POST /api/payment/verify` in `src/app/api/payment/verify/route.ts`: lightweight API version of payment verification.
- `CheckoutClient` in `src/app/(customer)/checkout/CheckoutClient.tsx`: drives Razorpay UI and order redirect flow.

## Shipping

- `createShipment()` in `src/actions/shipping.ts`: admin action that chooses manual or Shiprocket provider from global mode.
- `updateManualShipment()` in `src/actions/shipping.ts`: edits manual tracking fields only when the order is manual.
- `getOrderShippingDetails()` in `src/lib/shipping/utils.ts`: reads all shipping fields for a single order.
- `canCreateShipment()` in `src/lib/shipping/utils.ts`: checks whether shipment creation is allowed.
- `syncOrderWithShiprocket()` in `src/services/shiprocket.ts`: creates Shiprocket shipment state and stores raw payloads.
- `applyShiprocketWebhook()` in `src/services/shiprocket.ts`: maps webhook updates back into order fields.
- `POST /api/webhooks/shiprocket` in `src/app/api/webhooks/shiprocket/route.ts`: verifies and applies Shiprocket webhooks.

## Schema

- `supabase/migrations/001_initial.sql`: core tables and RLS.
- `supabase/migrations/005_shiprocket_logistics.sql`: Shiprocket order columns.
- `supabase/migrations/database-migration-shipping.sql`: manual shipment columns.
- `supabase/migrations/010_global_shipping_settings.sql`: global shipping mode inside `site_settings`.

## Rule Of Thumb

- `AUTOMATIC` = Shiprocket
- `MANUAL` = staff-managed shipping
- Do not sync manual orders to Shiprocket
- Keep payload examples and response shapes in `PROJECT_CONTEXT_LONG.md`

