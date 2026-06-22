# PrintForge Growth Platform - Complete Implementation Guide

## Overview

This is a complete production-grade ecommerce growth platform for 3D printing business with:
- Email automation
- Customer management
- Analytics tracking
- WhatsApp integration
- Abandoned cart recovery
- Admin KPI dashboard

## Features Implemented

### ✅ Feature 0: Customer Communication Foundation

#### Email System (Resend)
- **Service**: `src/services/email.ts`
- **Templates**:
  - Order Confirmation
  - Printing Started
  - Printing Completed  
  - Shipped
  - Delivered
  - Abandoned Cart
- **Features**:
  - Duplicate prevention
  - Delivery logging
  - Retry mechanism
  - Email queue tracking

#### WhatsApp Integration
- **Components**:
  - `src/components/whatsapp/WhatsAppFloatingButton.tsx` - Fixed floating button
  - `src/components/whatsapp/WhatsAppContactButton.tsx` - Contextual button
- **Features**:
  - Product inquiry
  - Order inquiry
  - Custom print inquiry
  - Analytics tracking for all clicks

### ✅ Feature 1: Payment Success Emails

Integrated into `src/actions/checkout.ts`:
- Email sent on COD orders
- Email sent after payment verification
- Customer data collected
- Order linked to customer

### ✅ Feature 2: Product Analytics

**Service**: `src/services/analytics.ts`

Tracks:
- `product_view`
- `product_gallery_view`
- `product_image_click`
- `add_to_cart`
- `remove_from_cart`
- `checkout_started`
- `payment_attempted`
- `payment_success`
- `order_completed`
- `whatsapp_click`
- `contact_form_submit`

**Features**:
- Session management
- Device detection
- Browser detection
- Anonymous tracking
- User tracking

### ✅ Feature 3: Product Performance Dashboard

**Page**: `src/app/(admin)/admin/analytics/page.tsx`

Shows:
- Most viewed products
- Most added to cart
- Highest conversion products
- Revenue by product
- Date filters (7, 30, 90 days)

### ✅ Feature 4: Customer Data Collection

**Service**: `src/services/customer.ts`

GDPR-compliant collection from:
- Registration
- Checkout
- Payment gateway
- Contact forms

**Features**:
- Upsert logic (create or update)
- Automatic stats tracking
- Customer segments
- Top customers list

### ✅ Feature 5: Abandoned Cart System

**Service**: `src/services/cart.ts`

**Features**:
- Track cart sessions
- Mark as abandoned after 1 hour
- Send recovery emails
- Track recovery
- Calculate recovery stats

**Run regularly**:
```typescript
import { markAbandonedCarts } from '@/services/cart';
// Call this via cron job every hour
await markAbandonedCarts();
```

### ✅ Feature 6: Admin KPI Dashboard

**Page**: `src/app/(admin)/admin/analytics/page.tsx`
**Component**: `src/app/(admin)/admin/analytics/AnalyticsDashboard.tsx`

**Metrics**:
- Total Revenue
- Revenue Today
- Total Orders
- Average Order Value
- Conversion Rate
- Total Customers
- New Customers
- Returning Customers
- Abandoned Carts
- Recovered Revenue
- WhatsApp Clicks
- Contact Form Submissions

**Charts**:
- Conversion Funnel
- Product Performance Table
- Top Customers Table

## Database Schema

### New Tables

#### `email_logs`
```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  email TEXT NOT NULL,
  template_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `customers`
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  email TEXT UNIQUE,
  phone TEXT,
  name TEXT,
  first_order_date TIMESTAMPTZ,
  last_order_date TIMESTAMPTZ,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC(12,2) DEFAULT 0,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `cart_sessions`
```sql
CREATE TABLE cart_sessions (
  id UUID PRIMARY KEY,
  session_id TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id),
  user_id UUID REFERENCES users(id),
  cart_value NUMERIC(12,2) DEFAULT 0,
  cart_data JSONB DEFAULT '[]',
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  abandoned BOOLEAN DEFAULT false,
  recovered BOOLEAN DEFAULT false,
  recovery_email_sent BOOLEAN DEFAULT false,
  recovered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `leads`
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  source TEXT NOT NULL,
  product_id UUID REFERENCES products(id),
  order_id UUID REFERENCES orders(id),
  message TEXT,
  metadata JSONB,
  converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Enhanced Tables

#### `analytics_events` (new columns)
- `event_name` TEXT
- `product_id` UUID
- `session_id` TEXT
- `page_url` TEXT
- `referrer` TEXT
- `device_type` TEXT
- `browser` TEXT
- `country` TEXT
- `order_id` UUID
- `revenue` NUMERIC(12,2)
- `cart_value` NUMERIC(12,2)

## Environment Variables

Add to `.env.local`:

```bash
# Email (Resend)
RESEND_API_KEY=re_your_resend_api_key_here
EMAIL_FROM=PrintForge <orders@printforge.co>

# WhatsApp
WHATSAPP_NUMBER=+919876543210
NEXT_PUBLIC_WHATSAPP_NUMBER=+919876543210
WHATSAPP_DEFAULT_MESSAGE=Hello, I would like to know more about your 3D printing services.
NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE=Hello, I would like to know more about your 3D printing services.
```

## Setup Instructions

### 1. Install Dependencies

Already installed:
```bash
npm install resend
```

### 2. Run Database Migration

```bash
# Apply migration
psql -h your-db-host -U postgres -d printforge < supabase/migrations/008_complete_growth_platform.sql
```

Or via Supabase dashboard:
1. Go to SQL Editor
2. Paste contents of `supabase/migrations/008_complete_growth_platform.sql`
3. Run

### 3. Configure Resend

1. Sign up at [resend.com](https://resend.com)
2. Get API key
3. Add domain verification
4. Update `RESEND_API_KEY` in `.env.local`

### 4. Configure WhatsApp

1. Get WhatsApp Business number
2. Format as `+[country code][number]`
3. Update `WHATSAPP_NUMBER` in `.env.local`

### 5. Add WhatsApp Button to Layouts

Add to `src/app/(public)/layout.tsx`:
```typescript
import WhatsAppFloatingButton from '@/components/whatsapp/WhatsAppFloatingButton';

export default function PublicLayout({ children }) {
  return (
    <>
      {children}
      <WhatsAppFloatingButton />
    </>
  );
}
```

### 6. Add Analytics to Product Pages

```typescript
import { trackProductView } from '@/services/analytics';

// In product page
await trackProductView(productId, userId);
```

### 7. Add Analytics to Cart

```typescript
import { trackAddToCart } from '@/services/analytics';
import { trackCartSession } from '@/actions/analytics';

// When adding to cart
await trackAddToCart(productId, cartTotal, userId);
await trackCartSession(sessionId, cartItems, userId);
```

### 8. Set Up Cron Jobs

Create a cron job (e.g., Vercel Cron, AWS EventBridge) to run hourly:

**API Route**: `src/app/api/cron/abandoned-carts/route.ts`
```typescript
import { markAbandonedCarts } from '@/services/cart';
import { retryFailedEmails } from '@/services/email';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const cartResult = await markAbandonedCarts();
  const emailResult = await retryFailedEmails();

  return Response.json({
    success: true,
    carts: cartResult,
    emails: emailResult
  });
}
```

Add to `.env.local`:
```bash
CRON_SECRET=your-random-secret-here
```

### 9. Access Admin Dashboard

Navigate to: `/admin/analytics`

## Usage Examples

### Send Order Email

```typescript
import { sendOrderConfirmationEmail } from '@/services/email';

await sendOrderConfirmationEmail({
  orderId: 'uuid',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  totalAmount: 1500,
  orderStatus: 'Confirmed'
});
```

### Track Analytics Event

```typescript
import { trackEvent } from '@/actions/analytics';

await trackEvent('product_view', {
  productId: 'product-uuid',
  userId: 'user-uuid' // optional
});
```

### Create Lead

```typescript
import { createLead } from '@/actions/analytics';

await createLead({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+919876543210',
  message: 'Interested in custom print',
  source: 'contact_form',
  productId: 'product-uuid' // optional
});
```

### Add WhatsApp Button

```typescript
import WhatsAppContactButton from '@/components/whatsapp/WhatsAppContactButton';

// Product page
<WhatsAppContactButton 
  productName="Custom 3D Print"
  productId="product-uuid"
  variant="primary"
/>

// Order page
<WhatsAppContactButton 
  orderId="order-uuid"
  variant="outline"
/>
```

## API Routes for External Integration

### Webhook for Order Status Updates

**Route**: `src/app/api/webhooks/order-status/route.ts`
```typescript
import { sendPrintingStartedEmail, sendShippedEmail } from '@/services/email';

export async function POST(request: Request) {
  const { orderId, status, customerEmail, customerName } = await request.json();

  if (status === 'printing') {
    await sendPrintingStartedEmail({
      orderId,
      customerEmail,
      customerName
    });
  } else if (status === 'shipped') {
    await sendShippedEmail({
      orderId,
      customerEmail,
      customerName,
      trackingNumber,
      trackingUrl
    });
  }

  return Response.json({ success: true });
}
```

## Testing

### Test Email Sending

```typescript
// In admin panel or API route
import { sendEmail } from '@/services/email';

await sendEmail('test_template', {
  to: 'your-email@example.com',
  subject: 'Test Email',
  html: '<h1>Test</h1>',
  text: 'Test'
});
```

### Test Analytics

```typescript
// Track test event
await trackEvent('product_view', {
  productId: 'test-product-id'
});

// Check analytics_events table
```

### Test Abandoned Cart

```typescript
// Create cart session
await trackCartSession('test-session', [
  { id: '1', productId: 'p1', name: 'Product', price: 100, quantity: 1 }
], null);

// Wait 1 hour or manually mark as abandoned in database

// Run abandoned cart job
await markAbandonedCarts();
```

## Security Considerations

1. **RLS Policies**: Applied to all new tables
2. **Admin-only access**: Analytics dashboard requires admin role
3. **Email deduplication**: Prevents sending duplicate emails
4. **GDPR Compliance**: Only collects data from legitimate sources
5. **Rate limiting**: Implement on public forms
6. **CSRF protection**: Use Next.js built-in protection

## Performance Optimization

1. **Indexes**: Added on all foreign keys and frequently queried columns
2. **Database functions**: Use Postgres functions for complex queries
3. **Caching**: Consider caching analytics data for 5-15 minutes
4. **Batch operations**: Use batch inserts for analytics events

## Monitoring

### Key Metrics to Monitor

1. **Email delivery rate**: Check `email_logs` table
2. **Cart abandonment rate**: Track in dashboard
3. **Conversion funnel drop-off**: Monitor funnel steps
4. **WhatsApp click-through rate**: Track engagement
5. **Recovery rate**: Measure abandoned cart recovery

### Alerts to Set Up

1. Failed email deliveries > 5%
2. Conversion rate drops > 20%
3. Cart abandonment rate > 70%
4. No orders in 24 hours
5. Shiprocket sync failures

## Troubleshooting

### Emails Not Sending

1. Check `RESEND_API_KEY` is valid
2. Verify domain in Resend dashboard
3. Check `email_logs` table for errors
4. Review Resend dashboard for delivery issues

### Analytics Not Tracking

1. Verify database migration ran successfully
2. Check browser console for errors
3. Verify RLS policies allow inserts
4. Check `analytics_events` table directly

### WhatsApp Button Not Showing

1. Verify `NEXT_PUBLIC_WHATSAPP_NUMBER` is set
2. Check component is imported in layout
3. Verify number format is correct

## Next Steps

1. **Email Templates**: Customize HTML templates with your branding
2. **SMS Integration**: Add SMS notifications via Twilio
3. **Push Notifications**: Implement web push for cart recovery
4. **A/B Testing**: Test different email subject lines
5. **Predictive Analytics**: Add ML for customer lifetime value prediction
6. **Export Reports**: Implement CSV/Excel export for all dashboards
7. **Multi-currency**: Support international customers
8. **Inventory Alerts**: Email when materials run low

## Support

For issues or questions:
1. Check database logs in Supabase dashboard
2. Review server logs in Vercel/hosting dashboard
3. Check email delivery in Resend dashboard
4. Review analytics data in admin dashboard

## License

Proprietary - PrintForge Internal Use Only
