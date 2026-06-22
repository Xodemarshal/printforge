# 🚀 Quick Start Guide - PrintForge Growth Platform

Get your growth platform up and running in 30 minutes.

---

## Prerequisites

- ✅ Next.js app running
- ✅ Supabase database configured
- ✅ Resend account (sign up at resend.com)
- ✅ WhatsApp Business number

---

## Step 1: Database (5 minutes)

### Option A: Supabase Dashboard
1. Go to your Supabase project
2. Click "SQL Editor"
3. Open `supabase/migrations/008_complete_growth_platform.sql`
4. Copy entire contents
5. Paste in SQL Editor
6. Click "Run"

### Option B: CLI
```bash
psql -h db.xxxxx.supabase.co -U postgres -d postgres -f supabase/migrations/008_complete_growth_platform.sql
```

**Verify:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('email_logs', 'customers', 'cart_sessions', 'leads');
```
Should show all 4 tables.

---

## Step 2: Resend Setup (5 minutes)

1. Go to [resend.com/signup](https://resend.com/signup)
2. Create account
3. Click "API Keys" → "Create API Key"
4. Copy the key (starts with `re_`)
5. Add domain:
   - Click "Domains"
   - Click "Add Domain"
   - Enter your domain
   - Add DNS records shown
   - Wait for verification (can take a few minutes)

---

## Step 3: Environment Variables (2 minutes)

Update `.env.local`:

```bash
# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx  # Paste your key here
EMAIL_FROM=PrintForge <orders@yourdomain.com>  # Use your verified domain

# WhatsApp
WHATSAPP_NUMBER=+919876543210  # Your business number with country code
NEXT_PUBLIC_WHATSAPP_NUMBER=+919876543210  # Same number

# Cron (generate random string)
CRON_SECRET=your-super-secret-random-string-here
```

**Generate secure CRON_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 4: Deploy (3 minutes)

### Local Test First
```bash
npm run build
```

Fix any errors, then:

### Deploy to Vercel
```bash
vercel --prod
```

Or push to your Git repo if auto-deploy is configured.

### Add Environment Variables in Vercel
1. Go to Vercel project settings
2. Click "Environment Variables"
3. Add all variables from `.env.local`
4. Redeploy

---

## Step 5: Set Up Cron Job (5 minutes)

### Option A: Vercel Cron (Recommended)

Create `vercel.json` in project root:
```json
{
  "crons": [{
    "path": "/api/cron/abandoned-carts",
    "schedule": "0 * * * *"
  }]
}
```

Commit and push:
```bash
git add vercel.json
git commit -m "Add cron job"
git push
```

### Option B: External Cron Service

Use cron-job.org or similar:
- URL: `https://yourdomain.com/api/cron/abandoned-carts`
- Schedule: Every hour (`0 * * * *`)
- Headers: `Authorization: Bearer YOUR_CRON_SECRET`

---

## Step 6: Add WhatsApp Button (5 minutes)

### Public Pages Layout

Edit `src/app/(public)/layout.tsx`:

```typescript
import WhatsAppFloatingButton from '@/components/whatsapp/WhatsAppFloatingButton';

export default function PublicLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <>
      {children}
      <WhatsAppFloatingButton />
    </>
  );
}
```

---

## Step 7: Test Everything (5 minutes)

### Test 1: Email Sending
Place a test order with Cash on Delivery.

**Expected:** Order confirmation email received within 1 minute.

**Check:** 
```sql
SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 5;
```

### Test 2: Analytics Tracking
View a product page.

**Check:**
```sql
SELECT * FROM analytics_events 
WHERE event_name = 'product_view' 
ORDER BY created_at DESC LIMIT 5;
```

### Test 3: WhatsApp Button
Click the floating WhatsApp button.

**Expected:** Opens WhatsApp with pre-filled message.

### Test 4: Customer Tracking
Complete an order.

**Check:**
```sql
SELECT * FROM customers ORDER BY created_at DESC LIMIT 5;
```

### Test 5: Admin Dashboard
Navigate to `/admin/analytics`

**Expected:** Dashboard loads with metrics.

---

## Verification Checklist

After 1 hour of live traffic:

- [ ] At least 1 email sent (check `email_logs`)
- [ ] Analytics events tracked (check `analytics_events`)
- [ ] WhatsApp button visible on public pages
- [ ] Admin dashboard accessible at `/admin/analytics`
- [ ] Customer data collected (check `customers`)
- [ ] No errors in Vercel logs
- [ ] No errors in Supabase logs

---

## Quick Troubleshooting

### "Unauthorized" on admin dashboard
- Verify your user has `role = 'admin'` in `users` table
- Update: `UPDATE users SET role = 'admin' WHERE email = 'your@email.com';`

### Emails not sending
- Check `RESEND_API_KEY` is correct
- Verify domain in Resend dashboard
- Check `email_logs` table for errors

### WhatsApp button not showing
- Check `NEXT_PUBLIC_WHATSAPP_NUMBER` is set
- Verify number format: `+[country][number]` (e.g., `+919876543210`)
- Clear browser cache

### Analytics not tracking
- Check Supabase RLS policies allow inserts
- Open browser console and check for errors
- Verify migration ran successfully

### "Table does not exist" errors
- Database migration didn't run
- Re-run migration file
- Check Supabase logs

---

## Usage Examples

### Send Test Email

Create `src/app/api/test-email/route.ts`:
```typescript
import { sendOrderConfirmationEmail } from '@/services/email';

export async function GET() {
  await sendOrderConfirmationEmail({
    orderId: 'test-123',
    customerName: 'Test User',
    customerEmail: 'your-email@example.com',
    totalAmount: 1000,
    orderStatus: 'Confirmed'
  });
  
  return Response.json({ success: true });
}
```

Visit `/api/test-email` to send test.

### Track Custom Event

```typescript
import { trackEvent } from '@/actions/analytics';

await trackEvent('custom_event', {
  userId: 'user-uuid',
  metadata: { action: 'special_click' }
});
```

### Add WhatsApp Button to Product Page

```typescript
import WhatsAppContactButton from '@/components/whatsapp/WhatsAppContactButton';

<WhatsAppContactButton 
  productName={product.name}
  productId={product.id}
  variant="primary"
  size="lg"
/>
```

---

## Next Steps After Setup

### Day 1
- Monitor email delivery in Resend dashboard
- Check analytics events are being tracked
- Test abandoned cart flow (add items, wait 1 hour, check email)

### Week 1
- Review conversion funnel in admin dashboard
- Check product performance metrics
- Analyze customer data collection
- Review lead sources

### Month 1
- Optimize email templates based on open rates
- A/B test abandoned cart email timing
- Identify top-performing products
- Segment customers for targeted campaigns

---

## Resources

- **Full Documentation**: `GROWTH_PLATFORM_README.md`
- **Deployment Checklist**: `DEPLOYMENT_CHECKLIST.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`

---

## Support

### Common Issues

**Build fails with TypeScript errors**
```bash
npm run build 2>&1 | grep "error TS"
```
Review errors and fix. All files should compile without errors.

**Database connection issues**
- Check Supabase URL and keys are correct
- Verify IP allowlist in Supabase (if applicable)
- Test connection: `psql -h db.xxxxx.supabase.co -U postgres`

**Cron job not running**
- Check Vercel deployment logs
- Verify `vercel.json` is committed
- Test manually: `curl https://yourdomain.com/api/cron/abandoned-carts -H "Authorization: Bearer YOUR_SECRET"`

---

## Success! 🎉

If you've completed all steps, you now have:

✅ Automated email system
✅ Customer analytics tracking
✅ Abandoned cart recovery
✅ WhatsApp integration
✅ Admin KPI dashboard
✅ Lead management system

**You're ready to scale your business!**

---

## What's Tracked Automatically

From this moment:
- Every product view
- Every cart action
- Every checkout attempt
- Every order
- Every WhatsApp click
- Every email sent
- Every abandoned cart
- Every customer's lifetime value

**All visible in your admin dashboard** at `/admin/analytics`

---

## Quick Commands

```bash
# Check database tables
psql -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"

# View recent emails
psql -c "SELECT template_name, status, created_at FROM email_logs ORDER BY created_at DESC LIMIT 10;"

# View analytics events
psql -c "SELECT event_name, COUNT(*) FROM analytics_events GROUP BY event_name;"

# View customers
psql -c "SELECT name, email, total_orders, total_spent FROM customers ORDER BY total_spent DESC LIMIT 10;"
```

---

**Setup Time**: ~30 minutes
**Maintenance Required**: Minimal (automated)
**ROI**: High (automated recovery & insights)

**Happy Growing! 🚀**
