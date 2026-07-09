# PrintForge LLM Context

This file is the long-form operating reference for the codebase. It is written so a human or another LLM can safely modify behavior without guessing where data lives or which function owns a flow.

## 1. Stack And Runtime

- Framework: Next.js 15 app router
- UI: React 19, Tailwind CSS, lucide-react, next-themes
- Backend: Supabase Postgres + RLS + server actions + route handlers
- Payments: Razorpay
- Email: Resend
- Analytics and background tasks: server routes under `src/app/api/cron`
- Shipping:
  - `AUTOMATIC` means Shiprocket
  - `MANUAL` means staff-managed shipping

Primary dependencies are listed in `package.json`.

## 2. Repository Shape

The repository is split into:

- `src/app`: pages, route handlers, and app router entrypoints
- `src/actions`: server actions for settings, checkout, shipping, products, orders, and admin tools
- `src/services`: domain services that contain the actual business logic
- `src/lib`: shared utilities, guards, validation, Supabase clients, and shipping provider selection
- `supabase/migrations`: schema history and source of truth for DB columns and RLS
- `src/components`: UI and dashboards
- `src/types`: shared TypeScript models

If you need to change behavior, prefer:

- `src/actions/*` for server action request handling
- `src/services/*` for domain logic
- `src/lib/shipping/*` for shipping mode/provider decisions
- `supabase/migrations/*` for schema changes

## 3. Core Data Model

### 3.1 `settings`

Source:

- `supabase/migrations/001_initial.sql`
- `supabase/migrations/004_settings_public_select.sql`
- `supabase/migrations/010_global_shipping_settings.sql`
- `src/actions/settings.ts`
- `src/lib/shipping/provider.ts`

Important table columns:

- `key`
- `value` jsonb
- `updated_at`

Important key:

- `site_settings`

Current `site_settings` JSON shape:

```json
{
  "siteName": "PrintForge",
  "logoUrl": "/design/logo.png",
  "faviconUrl": "/design/logo.png",
  "shippingMode": "AUTOMATIC",
  "hero": {
    "title": "Ideas",
    "coloredTitle": "Take Shape.",
    "subtitle": "Premium Products",
    "description": "Transform your ideas into stunning physical products with our premium design services and marketplace.",
    "buttonText": "Explore Products",
    "imageUrl": "https://picsum.photos/seed/wooden-guardian-hero/1400/1600",
    "showcaseTitle": "Custom Product",
    "showcaseItalic": "Design Made Easy",
    "featuredItems": [
      { "img": "...", "label": "...", "tag": "..." }
    ],
    "stats": {
      "productsCount": "2.5k+",
      "productsLabel": "Products Created",
      "rating": "4.9/5",
      "ratingLabel": "Customer Rating"
    }
  }
}
```

Critical rule:

- `shippingMode` lives inside `settings.value.site_settings`
- do not treat shipping mode as a separate setting row
- do not treat shipping mode as a top-level order-only field

### 3.2 `orders`

Source:

- `supabase/migrations/001_initial.sql`
- `supabase/migrations/005_shiprocket_logistics.sql`
- `supabase/migrations/database-migration-shipping.sql`
- `src/types/index.ts`
- `src/types/shipping.ts`
- `src/actions/checkout.ts`
- `src/services/shiprocket.ts`
- `src/actions/shipping.ts`

Important shipping-related columns:

- `shipping_mode`
- `shipping_provider`
- `shipment_status`
- `courier_name`
- `tracking_number`
- `tracking_url`
- `dispatch_date`
- `delivered_date`
- `shipment_notes`
- `shiprocket_order_id`
- `shiprocket_shipment_id`
- `shiprocket_awb_number`
- `shiprocket_tracking_id`
- `shiprocket_courier_name`
- `shiprocket_label_pdf_url`
- `shiprocket_tracking_url`
- `shiprocket_status`
- `shiprocket_pickup_status`
- `shiprocket_tracking_events`
- `shiprocket_payload`
- `shiprocket_last_event`
- `shiprocket_last_synced_at`
- `shiprocket_error`

Important order rules:

- `shipping_mode` determines whether the order should use Shiprocket or manual shipping
- `shipping_provider` is informational and should align with `shipping_mode`
- manual orders must not be synced to Shiprocket
- automatic orders may sync after payment

### 3.3 `products`

Important columns used in shipping and package computation:

- `shipping_weight_grams`
- `shipping_length_cm`
- `shipping_width_cm`
- `shipping_height_cm`

Used by:

- `src/actions/checkout.ts`
- `src/services/shiprocket.ts`

### 3.4 `addresses`

Used to build shipping payloads and order context:

- `line1`
- `line2`
- `city`
- `state`
- `postal_code`
- `country`

### 3.5 Growth tables added by later migrations

Source:

- `supabase/migrations/008_complete_growth_platform.sql`

Important tables:

- `email_logs`
- `customers`
- `cart_sessions`
- `leads`

Important analytics fields on `analytics_events`:

- `event_name`
- `product_id`
- `session_id`
- `page_url`
- `referrer`
- `device_type`
- `browser`
- `country`
- `order_id`
- `revenue`
- `cart_value`

## 4. Shipping Architecture

### 4.1 Mode Selection

Source:

- `src/lib/shipping/provider.ts`
- `src/actions/settings.ts`
- `src/app/(admin)/admin/settings/SettingsForm.tsx`

Mode values:

- `AUTOMATIC`
- `MANUAL`

Resolution order:

1. Read `settings.value.site_settings.shippingMode`
2. Fallback to `AUTOMATIC`

### 4.2 Provider Factory

Source:

- `src/lib/shipping/provider.ts`
- `src/lib/shipping/manual.ts`
- `src/lib/shipping/shiprocket.ts`

Factory behavior:

- `AUTOMATIC` -> `ShiprocketProvider`
- `MANUAL` -> `ManualShippingProvider`

### 4.3 Shiprocket Service

Source:

- `src/services/shiprocket.ts`
- `src/lib/shipping/shiprocket.ts`
- `src/app/api/webhooks/shiprocket/route.ts`

The service handles:

- building Shiprocket payloads
- login/token caching
- creating Shiprocket orders
- assigning AWBs
- generating labels
- mapping Shiprocket webhook status back to order status
- storing raw Shiprocket request/response payloads in the order row

Important safety rule:

- `syncOrderWithShiprocket()` must not process manual orders

### 4.4 Manual Shipping Service

Source:

- `src/lib/shipping/manual.ts`

Manual mode behavior:

- creates local shipment state only
- writes `shipping_mode = "MANUAL"`
- writes `shipment_status = "order_placed"`
- does not call Shiprocket APIs

## 5. Payment And Checkout Flow

### 5.1 Customer Checkout UI

Source:

- `src/app/(customer)/checkout/CheckoutClient.tsx`

Flow:

1. Customer fills address and payment details
2. `createOrderAction()` is called
3. Razorpay opens
4. After payment success, `verifyPaymentAction()` is called
5. UI shows a loading state while verification is happening
6. On success, the customer is redirected to `/orders/{id}`

Important UI behavior:

- the payment-success wait screen should appear immediately after Razorpay returns success
- do not wait for extra artificial delay before showing loading state

### 5.2 `createOrderAction`

Source:

- `src/actions/checkout.ts`

Request payload shape:

```ts
{
  idempotencyKey: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  shippingAddress: {
    fullName?: string;
    phone?: string;
    email?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  discountAmount?: number;
  couponId?: string;
}
```

Validation rules:

- payment method must be `razorpay`
- country must be `IN` for this Shiprocket flow
- phone number is required
- phone number must match the Indian shipping format check
- zip code must be a 6-digit pincode

Behavior:

- looks for an existing order by `idempotency_key`
- creates or reuses a saved address
- creates a Razorpay order
- inserts into `orders`
- inserts `order_items`
- links customer data
- sends notification

Response shape on success:

```ts
{
  success: true;
  orderId: string;
  razorpayOrderId: string | null;
  razorpayKeyId: string | undefined;
}
```

Response shape on failure:

```ts
{
  error: string;
}
```

Important order insert rule:

- `shipping_mode` must be written from global settings
- `shipping_provider` must be `shiprocket` only when automatic
- manual mode should write a manual provider value instead of forcing Shiprocket

### 5.3 `verifyPaymentAction`

Source:

- `src/actions/checkout.ts`

Input:

```ts
verifyPaymentAction(orderId: string, razorpayPaymentId: string, razorpaySignature: string)
```

Behavior:

- fetches the order
- fetches Razorpay payment details if available
- updates the order as paid/confirmed
- updates `payment_method`
- sends email
- tracks analytics
- syncs with Shiprocket only if `shipping_mode` is `AUTOMATIC`

Response shape:

```ts
{ success: true }
```

or:

```ts
{ error: string }
```

### 5.4 Payment API Route

Source:

- `src/app/api/payment/create-order/route.ts`
- `src/app/api/payment/verify/route.ts`

These routes mirror the server-action flow for alternative integrations.

`/api/payment/create-order` request body:

```ts
{
  amount: number;
  currency?: string;
  paymentMethod?: string;
}
```

Response:

```ts
{ orderId: string }
```

`/api/payment/verify` request body:

```ts
{
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  items?: Array<{
    product_id: string;
    quantity: number;
    price: number;
    name?: string;
  }>;
}
```

Response on success:

```ts
{ success: true, clearCart: true }
```

Response on failure:

```ts
{ error: string }
```

Important route rule:

- payment verification must not trigger Shiprocket sync for manual orders

## 6. Shipping API And Action Flows

### 6.1 `getOrderShippingDetails`

Source:

- `src/lib/shipping/utils.ts`

Returns:

- `shipping_mode`
- `shipment_status`
- `courier_name`
- `tracking_number`
- `tracking_url`
- `dispatch_date`
- `delivered_date`
- `shipment_notes`
- all Shiprocket fields
- `status`
- `payment_status`

This is the primary read model for shipping pages and panels.

### 6.2 `canCreateShipment`

Rules:

- order status must be `confirmed`, `processing`, or `pending`
- payment must be `paid`
- shipment must not already exist

Returns:

```ts
boolean
```

### 6.3 `canSwitchShippingMode`

Rules:

- mode can be switched only if no AWB/tracking number exists

Returns:

```ts
boolean
```

### 6.4 `getNextShipmentStatus` / `getPreviousShipmentStatus`

These helpers walk a fixed status chain:

`order_placed -> payment_confirmed -> printing -> quality_check -> packed -> ready_for_dispatch -> shipped -> out_for_delivery -> delivered`

### 6.5 `isOrderEligibleForShipping`

Checks:

- order exists
- order is not cancelled
- payment is paid
- shipping address is complete

Returns:

```ts
{
  eligible: boolean;
  reason?: string;
}
```

### 6.6 `createShipment`

Source:

- `src/actions/shipping.ts`

Behavior:

- admin only
- loads order
- skips if a shipment already exists
- chooses provider using global shipping mode
- calls `provider.createShipment(orderId)`

Response:

```ts
{
  success?: boolean;
  error?: string;
  data?: any;
}
```

### 6.7 `updateManualShipment`

Source:

- `src/actions/shipping.ts`

Behavior:

- admin only
- order must have `shipping_mode = MANUAL`
- updates manual tracking fields
- can advance order status based on shipment status
- sends customer notifications

## 7. Shiprocket Payloads And Responses

### 7.1 Order Create Payload

Generated by:

- `src/services/shiprocket.ts`

Payload sent to Shiprocket `/orders/create/adhoc`:

```ts
{
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_address_2: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: true;
  shipping_customer_name: string;
  shipping_last_name: string;
  shipping_address: string;
  shipping_address_2: string;
  shipping_city: string;
  shipping_pincode: string;
  shipping_state: string;
  shipping_country: string;
  shipping_email: string;
  shipping_phone: string;
  order_items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: string;
    discount: string;
    tax: string;
    hsn: string;
    weight: number;
  }>;
  payment_method: "Prepaid";
  sub_total: string;
  length: string;
  breadth: string;
  height: string;
  weight: string;
}
```

Source of values:

- order row
- user row
- address row
- product rows

### 7.2 Shiprocket Create Response

Expected fields used by the app:

- `order_id`
- `shipment_id`
- `awb_code`
- `awb_number`
- `courier_name`
- `tracking_id`
- `label_url`
- `label_pdf_url`

The app stores a normalized version in:

- `shiprocket_order_id`
- `shiprocket_shipment_id`
- `shiprocket_awb_number`
- `shiprocket_tracking_id`
- `shiprocket_courier_name`
- `shiprocket_label_pdf_url`
- `shiprocket_tracking_url`
- `shiprocket_status`
- `shiprocket_pickup_status`
- `shiprocket_payload`

### 7.3 Shiprocket Webhook Payload

Handled by:

- `src/app/api/webhooks/shiprocket/route.ts`
- `src/services/shiprocket.ts`

The webhook matcher accepts:

- `order_id`
- `shiprocket_order_id`
- `awb_code`
- `awb`
- `awbNumber`
- `awb_number`
- `tracking_id`
- `trackingId`
- `current_status`
- `status`
- `shipment_status`
- `event`

Webhook response:

```ts
{ success: true, orderId: string, status: string, awbNumber: string }
```

The route revalidates:

- `/admin/orders`
- `/admin/orders/{id}`
- `/orders`
- `/orders/{id}`
- `/admin/shipping/not-picked-up`

## 8. Settings Form And Global Shipping Mode

Source:

- `src/app/(admin)/admin/settings/SettingsForm.tsx`
- `src/actions/settings.ts`
- `src/lib/shipping/provider.ts`

Behavior:

- the form writes shipping mode inside the `site_settings` JSON
- the form should not use a separate shipping settings row
- the admin UI controls `shipping_mode` as part of the site settings payload

Settings action response:

```ts
{
  success: true;
  message: string;
}
```

or:

```ts
{
  error: string;
}
```

## 9. Migration Notes

### 9.1 `001_initial.sql`

Creates the initial core tables:

- users
- categories
- products
- addresses
- coupons
- orders
- order_items
- reviews
- wishlists
- stl_uploads
- print_jobs
- inventory
- inventory_logs
- analytics_events
- notifications
- support_tickets
- settings

Also defines:

- `set_updated_at`
- `is_admin`
- basic RLS and policies

### 9.2 `004_settings_public_select.sql`

Creates an `app_config.settings` variant and a `site_settings` seed.

This file shows an older experiment with schema separation. The runtime code in this repo uses `public.settings`.

### 9.3 `005_shiprocket_logistics.sql`

Adds the Shiprocket tracking columns to `public.orders` and default `shipping_provider = 'shiprocket'`.

Important note:

- this default is historical and can be misleading if manual mode is not explicitly written on insert

### 9.4 `database-migration-shipping.sql`

Adds manual shipping columns:

- `shipment_status`
- `courier_name`
- `tracking_number`
- `tracking_url`
- `dispatch_date`
- `delivered_date`
- `shipment_notes`

It explicitly notes that `shipping_mode` is a global setting, not an order column in that migration design.

### 9.5 `010_global_shipping_settings.sql`

Ensures `site_settings` contains:

- `shippingMode`

Default value:

- `AUTOMATIC`

## 10. High-Risk Modification Rules

If you change shipping or payment code, verify:

- manual orders do not enter Shiprocket sync
- automatic orders still sync after payment
- order creation stores the correct `shipping_mode`
- settings updates preserve existing hero/logo fields
- payment verification routes and server actions both respect mode
- manual shipping UI still reads `shipment_status`, `tracking_number`, and `tracking_url`

If you change schema:

- update the matching type in `src/types/index.ts`
- update any server action select lists
- update migration docs or add a new migration

If you change a payload:

- update the request shape in this file
- update server-side validation
- update the response shape if the route/action returns new fields

## 11. Function Ownership Map

This is the practical ownership model:

- `src/actions/settings.ts` owns site settings reads/writes
- `src/lib/shipping/provider.ts` owns global shipping mode resolution
- `src/actions/checkout.ts` owns checkout order creation and payment verification
- `src/app/api/payment/create-order/route.ts` owns API-based order creation
- `src/app/api/payment/verify/route.ts` owns API-based payment confirmation
- `src/services/shiprocket.ts` owns Shiprocket API integration and webhook state mapping
- `src/actions/shipping.ts` owns admin shipping operations
- `src/lib/shipping/utils.ts` owns shipping eligibility and helper logic
- `supabase/migrations/*` owns the database schema contract

## 12. Practical Editing Notes

Before editing any function, ask:

1. Is this a global setting, order-specific state, or provider-specific state?
2. Does this need to be stored in `settings.value.site_settings` or in `orders`?
3. Does the same logic exist in both a server action and a route handler?
4. Does this affect manual orders, automatic orders, or both?
5. Does the UI need to reflect the new state immediately after payment success?

Most bugs in this codebase come from writing the right value in the wrong place or updating one code path but not the parallel path.

