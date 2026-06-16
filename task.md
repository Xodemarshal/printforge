# Implementation Plan

- [x] 1. Initialize project and configure tooling


  - Scaffold Next.js 14 app with TypeScript and App Router: `npx create-next-app@latest printforge --typescript --tailwind --app`
  - Install and initialize ShadCN UI: `npx shadcn-ui@latest init`
  - Install core dependencies: `@supabase/supabase-js @supabase/ssr three @types/three razorpay`
  - Create `src/types/index.ts` with all shared TypeScript types (OrderStatus, CartItem, AnalyticsEventType, and DB row types)
  - Create `src/lib/constants.ts` with app-wide constants (order statuses, supported file types, material list)
  - _Requirements: 13.1, 13.2, 13.3_





- [x] 2. Set up Supabase and database schema

- [x] 2.1 Create Supabase project and configure environment variables

  - Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
  - Create `src/lib/supabase/client.ts` (browser client using `createBrowserClient`)


  - Create `src/lib/supabase/server.ts` (server client using `createServerClient` with cookie handling)
  - _Requirements: 1.1, 13.1_





- [ ] 2.2 Run database migrations
  - Write and execute SQL migration for all tables: users, categories, products, addresses, coupons, orders, order_items, reviews, wishlists, stl_uploads, print_jobs, inventory, inventory_logs, analytics_events, notifications, support_tickets, settings
  - Enable Row Level Security on all tables and write policies (customers access own rows, admins access all)
  - Seed inventory table with default materials (PLA, PETG, Resin, Packaging, LEDs, Electronics)


  - _Requirements: 2.1, 3.1, 4.1, 5.1, 6.1, 10.1, 12.6_

- [x] 3. Implement authentication

- [x] 3.1 Create auth middleware and route protection

  - Write `src/middleware.ts` to check session on every request using Supabase SSR
  - Redirect unauthenticated users from `(customer)` routes to `/login`
  - Redirect non-admin users from `/admin/*` routes with 403
  - _Requirements: 1.3, 1.4, 13.1, 13.2_

- [x] 3.2 Build login and register pages

  - Create `src/app/(auth)/login/page.tsx` with email/password form using ShadCN Form + Input
  - Create `src/app/(auth)/register/page.tsx` with name, email, password fields
  - Create `src/actions/auth.ts` with `loginAction`, `registerAction`, `logoutAction`, `resetPasswordAction` server actions
  - On register: create Supabase auth user, then insert into `users` table with role `'customer'`
  - _Requirements: 1.1, 1.2, 1.5_


- [x]* 3.3 Write tests for auth actions



  - Unit test `registerAction` and `loginAction` for validation and error cases
  - _Requirements: 1.1, 1.2_





- [ ] 4. Build shared layout components
- [-] 4.1 Create Header, Footer, and navigation




  - Build `src/components/layout/Header.tsx` with logo, nav links, search bar, cart icon, user menu
  - Build `src/components/layout/Footer.tsx` with links, tagline, and social icons
  - Build `src/components/layout/AdminSidebar.tsx` with all admin nav links
  - Add dark/light mode toggle using `next-themes` and persist preference
  - _Requirements: 14.1, 14.2_

- [ ] 4.2 Create root layouts for each route group
  - `src/app/(public)/layout.tsx` — Header + Footer
  - `src/app/(customer)/layout.tsx` — Header + Footer + auth check
  - `src/app/(admin)/layout.tsx` — AdminSidebar + auth + admin role check
  - _Requirements: 1.3, 1.4, 14.1_

- [x] 5. Implement product catalog
- [x] 5.1 Create product server actions and data fetching
  - Write `src/actions/products.ts` with: `getProducts`, `getProductBySlug`, `getFeaturedProducts`, `getBestSellers`, `searchProducts`
  - `searchProducts` must log a `search_performed` event via `trackEvent` utility
  - _Requirements: 2.1, 2.2, 2.3, 2.6_

- [x] 5.2 Build ProductCard and ProductGrid components
  - Create `src/components/products/ProductCard.tsx` — image, name, price, rating, wishlist toggle button
  - Create `src/components/products/ProductGrid.tsx` — responsive grid wrapper
  - _Requirements: 2.1, 6.1, 14.1_

- [x] 5.3 Build the Shop page
  - Create `src/app/(public)/shop/page.tsx` with product grid, category filter sidebar, search input, and pagination
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 5.4 Build the Product Detail page
  - Create `src/app/(public)/products/[slug]/page.tsx`
  - Display image gallery with zoom, video player (if applicable), description, specifications, material info, color options, Add to Cart button, Buy Now button, wishlist toggle
  - Log `product_viewed` event on page load via server action
  - Render `STLViewer` if `model_url` is set on the product
  - Display reviews section and related products
  - _Requirements: 2.4, 2.5, 2.6, 5.5_

- [ ]* 5.5 Write tests for product data fetching
  - Unit test `getProducts` filtering and pagination logic
  - _Requirements: 2.1, 2.2_

- [ ] 6. Implement STL upload and 3D viewer
- [ ] 6.1 Build the STLViewer component
  - Create `src/components/stl/STLViewer.tsx` using Three.js with `STLLoader`, `OBJLoader`, and `OrbitControls`
  - Support rotate, zoom, pan; show loading spinner while model loads
  - _Requirements: 3.2, 9.5_

- [ ] 6.2 Build the STL upload page
  - Create `src/app/(public)/upload-stl/page.tsx` with file drop zone (STL/OBJ/3MF, max 50MB)
  - On upload: call `src/actions/stl.ts` → `uploadSTLAction` which gets a signed upload URL from Supabase Storage and creates an `stl_uploads` row
  - After upload, render `STLViewer` with the file URL
  - Show print configuration form: material, color, layer height, infill %, quantity, notes
  - Call `estimatePriceAction` to compute and display estimated price
  - On submit, call `createCustomPrintRequestAction` which creates the STL upload order record
  - Log `stl_uploaded` event
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ]* 6.3 Write tests for STL actions
  - Unit test file type validation and price estimation logic
  - _Requirements: 3.6, 3.4_

- [ ] 7. Implement cart and checkout
- [ ] 7.1 Build cart state and CartDrawer
  - Create `src/hooks/useCart.ts` using React Context + localStorage persistence
  - Create `src/components/cart/CartDrawer.tsx` using ShadCN Sheet — list items, quantity controls, remove, subtotal
  - Log `add_to_cart` event when item is added
  - _Requirements: 4.1, 4.2_

- [ ] 7.2 Build checkout page
  - Create `src/app/(customer)/checkout/page.tsx`
  - Show order summary, address selector (load from `addresses` table), coupon input
  - Call `validateCouponAction` to check coupon and show discount
  - Log `checkout_started` event on page load
  - _Requirements: 4.3, 4.4, 4.8_

- [ ] 7.3 Implement Razorpay payment integration
  - Create `src/lib/razorpay.ts` with Razorpay SDK initialization
  - Create `src/app/api/payment/create-order/route.ts` — creates Razorpay order, returns order ID
  - Create `src/app/api/payment/verify/route.ts` — verifies HMAC signature, creates Order + OrderItems, clears cart, logs `order_completed`, sends order confirmation notification
  - Create `src/app/api/webhooks/razorpay/route.ts` — handles async payment status callbacks
  - _Requirements: 4.5, 4.6, 4.7, 12.6_

- [ ]* 7.4 Write tests for payment verification
  - Unit test HMAC signature verification logic
  - _Requirements: 4.6_

- [ ] 8. Implement customer order management
- [ ] 8.1 Build My Orders page and OrderTimeline component
  - Create `src/components/orders/OrderTimeline.tsx` — visual step timeline for all OrderStatus values
  - Create `src/app/(customer)/orders/page.tsx` — list of orders with status badges
  - Create `src/app/(customer)/orders/[id]/page.tsx` — order detail with timeline, items, and cancel button
  - Write `src/actions/orders.ts` with `getCustomerOrders`, `getOrderById`, `cancelOrderAction`
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8.2 Build review submission
  - Add review form to the order detail page for delivered items
  - Write `submitReviewAction` in `src/actions/reviews.ts`
  - Log `review_submitted` event
  - _Requirements: 5.5_

- [ ] 9. Implement wishlist and addresses
- [ ] 9.1 Build wishlist functionality
  - Create `src/hooks/useWishlist.ts` to toggle wishlist items via server action
  - Write `toggleWishlistAction`, `getWishlistAction` in `src/actions/products.ts`
  - Create `src/app/(customer)/wishlist/page.tsx` showing all wishlisted products
  - _Requirements: 6.1, 6.2_

- [ ] 9.2 Build address management
  - Create `src/app/(customer)/addresses/page.tsx` with add/edit/delete/set-default UI
  - Write `addAddressAction`, `updateAddressAction`, `deleteAddressAction` in `src/actions/auth.ts`
  - _Requirements: 6.3, 6.4, 6.5_

- [ ] 10. Implement notifications and email
- [ ] 10.1 Build notification service
  - Create `src/services/notifications.ts` with `sendNotification(userId, type, title, body)` — inserts into `notifications` table and sends email via `src/lib/email.ts`
  - Create `src/lib/email.ts` using Nodemailer or Resend SDK with HTML templates for each notification type
  - Call `sendNotification` from payment verification and order status update actions
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 10.2 Build in-app notification bell
  - Add notification icon to Header with unread count badge
  - Create dropdown showing recent notifications and mark-as-read action
  - _Requirements: 7.6_

- [ ] 11. Implement analytics event tracking
  - Create `src/lib/utils.ts` utility function `trackEvent(type, userId, metadata)` that inserts into `analytics_events`
  - Integrate `trackEvent` calls into all relevant server actions (already noted in tasks 5.1, 6.2, 7.1, 7.3, 8.2)
  - _Requirements: 12.6_

- [ ] 12. Build admin product and category management
- [ ] 12.1 Build admin products CRUD
  - Create `src/app/(admin)/admin/products/page.tsx` — table with search, filter, edit/delete actions using `AdminDataTable`
  - Create `src/app/(admin)/admin/products/new/page.tsx` and `edit/[id]/page.tsx` — form with name, description, price, category, image upload, material info, color options, active toggle
  - Write `createProductAction`, `updateProductAction`, `deleteProductAction` in `src/actions/products.ts`
  - Handle image uploads to Supabase Storage bucket `product-images`
  - _Requirements: 8.1, 8.2, 8.4, 8.5_

- [ ] 12.2 Build admin category management
  - Create `src/app/(admin)/admin/categories/page.tsx` — table with create/edit/delete
  - Write `createCategoryAction`, `updateCategoryAction`, `deleteCategoryAction` in `src/actions/products.ts`
  - _Requirements: 8.3_

- [ ] 13. Build admin order and print queue management
- [ ] 13.1 Build admin orders page
  - Create `src/app/(admin)/admin/orders/page.tsx` — filterable table by status, date, customer
  - Create `src/app/(admin)/admin/orders/[id]/page.tsx` — order detail with status update dropdown
  - Write `updateOrderStatusAction` in `src/actions/orders.ts` — updates status and triggers `sendNotification`
  - _Requirements: 9.1, 9.2_

- [ ] 13.2 Build print queue management page
  - Create `src/app/(admin)/admin/print-queue/page.tsx`
  - Display all print jobs with STL preview (using `STLViewer`), material, color, estimated hours, assigned printer, status
  - Add action buttons: Start Print, Pause, Resume, Complete, Reject
  - Write `updatePrintJobAction` in `src/actions/orders.ts`
  - _Requirements: 9.3, 9.4, 9.5_

- [ ] 14. Build admin inventory management
  - Create `src/app/(admin)/admin/inventory/page.tsx` — table showing all materials with current stock, threshold, and update form
  - Write `updateInventoryAction` in `src/actions/inventory.ts` — updates quantity and inserts an `inventory_logs` row
  - Show low stock warnings (quantity < threshold) on this page and the admin dashboard
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 15. Build admin coupon and review management
- [ ] 15.1 Build coupon management
  - Create `src/app/(admin)/admin/coupons/page.tsx` — list and create/edit coupons
  - Write `createCouponAction`, `updateCouponAction` in `src/actions/coupons.ts`
  - Write `validateCouponAction` used at checkout — checks code, expiry, usage count
  - _Requirements: 11.1, 11.2_

- [ ] 15.2 Build review moderation
  - Create `src/app/(admin)/admin/reviews/page.tsx` — list all reviews with approve/hide/delete actions
  - Write `updateReviewVisibilityAction`, `deleteReviewAction` in `src/actions/reviews.ts`
  - _Requirements: 11.3, 11.4_

- [ ] 16. Build admin analytics dashboard
  - Create `src/app/(admin)/admin/analytics/page.tsx`
  - Query `analytics_events` and `orders` to compute: daily/weekly/monthly revenue, total orders, most viewed/sold/wishlisted products, customer stats, search stats, print analytics
  - Use ShadCN charts (Recharts) to render bar/line charts for revenue
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 17. Build admin dashboard overview
  - Create `src/app/(admin)/admin/dashboard/page.tsx`
  - Show: revenue today, orders today, pending orders count, printing orders count, low inventory alerts, recent STL uploads, top selling products
  - _Requirements: 12.1, 10.2_

- [ ] 18. Build public homepage
  - Create `src/app/(public)/page.tsx` assembling all homepage sections
  - Build section components: `HeroBanner`, `FeaturedProducts`, `BestSellers`, `TrendingProducts`, `CategoryGrid`, `CustomerReviews`, `UploadCTA`, `FAQSection`
  - Add `JSON-LD` structured data and full meta tags for SEO
  - _Requirements: 14.5, 14.3_

- [ ] 19. Build remaining public pages
  - Create `src/app/(public)/about/page.tsx`, `contact/page.tsx`, `faq/page.tsx` with static content
  - Create `src/app/(public)/categories/[slug]/page.tsx` — products filtered by category
  - Create `src/app/(public)/best-sellers/page.tsx` and `new-arrivals/page.tsx`
  - Add proper `<meta>` and Open Graph tags to all public pages
  - _Requirements: 2.2, 14.3_

- [ ] 20. Build customer dashboard and account settings
  - Create `src/app/(customer)/dashboard/page.tsx` — recent orders, wishlist count, saved STL files
  - Create `src/app/(customer)/settings/page.tsx` — update name, phone, avatar
  - Write `updateProfileAction` in `src/actions/auth.ts`
  - _Requirements: 1.6_

- [ ] 21. Implement security hardening
  - Add server-side input validation with Zod to all server actions and API routes
  - Add rate limiting middleware using `src/lib/utils.ts` (IP-based request counter using Supabase or in-memory)
  - Add audit logging for all admin actions (status changes, product edits, inventory updates) by inserting into a `audit_logs` table or using `analytics_events`
  - Ensure all server actions re-verify session and role before processing
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ]* 21.1 Write integration tests for protected routes
  - Test that customer routes reject unauthenticated requests
  - Test that admin routes reject non-admin users
  - _Requirements: 13.1, 13.2_

- [ ] 22. SEO and accessibility polish
  - Add `generateMetadata` to all public page routes
  - Ensure all interactive elements have proper `aria-label`, keyboard focus styles, and contrast ratios
  - Add `alt` text to all images via `next/image`
  - Verify mobile responsiveness on Shop, Product Detail, Checkout, and Upload STL pages
  - _Requirements: 14.1, 14.3, 14.4_

