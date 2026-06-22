# Advanced Features Deployment Guide (Features 8-18)

## Prerequisites

Before deploying the advanced features, ensure:
- ✅ Foundation features (0-7) are deployed and working
- ✅ Database migration 008 has been applied
- ✅ Email system is configured
- ✅ Basic analytics are tracking

---

## Step 1: Database Migration

### Apply Migration 009

**Option A: Supabase Dashboard**
1. Go to Supabase project
2. Click "SQL Editor"
3. Open `supabase/migrations/009_advanced_features.sql`
4. Copy entire contents
5. Paste in SQL Editor
6. Click "Run"
7. Verify no errors

**Option B: CLI**
```bash
psql -h db.xxxxx.supabase.co -U postgres -d postgres -f supabase/migrations/009_advanced_features.sql
```

### Verify Tables Created

Run this query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN (
  'print_jobs',
  'product_reviews',
  'page_views',
  'admin_alerts',
  'lead_activities',
  'business_health_snapshots',
  'scheduled_reports',
  'report_history',
  'export_jobs',
  'admin_activity_logs'
);
```

Should return all 10 tables.

### Verify Columns Added

```sql
-- Check products table
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('filament_weight_grams', 'estimated_print_hours', 'estimated_total_cost');

-- Check orders table
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('material_cost', 'profit_amount', 'profit_margin');

-- Check analytics_events table
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'analytics_events' 
AND column_name IN ('utm_source', 'utm_medium', 'utm_campaign');
```

### Verify Functions Created

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN (
  'calculate_business_health_score',
  'get_profitability_stats'
);
```

---

## Step 2: Update Cron Configuration

### Vercel Cron (Recommended)

The `vercel.json` file has already been updated with all cron jobs:

```json
{
  "crons": [
    {
      "path": "/api/cron/hourly-tasks",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/daily-report",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/weekly-report",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

**Deploy:**
```bash
git add vercel.json
git commit -m "Update cron jobs"
git push
```

Vercel will automatically schedule the cron jobs.

### External Cron Service

If using external service (cron-job.org, etc.):

**Hourly Tasks:**
- URL: `https://yourdomain.com/api/cron/hourly-tasks`
- Schedule: `0 * * * *` (every hour)
- Headers: `Authorization: Bearer YOUR_CRON_SECRET`

**Daily Report:**
- URL: `https://yourdomain.com/api/cron/daily-report`
- Schedule: `0 9 * * *` (9 AM daily)
- Headers: `Authorization: Bearer YOUR_CRON_SECRET`

**Weekly Report:**
- URL: `https://yourdomain.com/api/cron/weekly-report`
- Schedule: `0 9 * * 1` (9 AM Monday)
- Headers: `Authorization: Bearer YOUR_CRON_SECRET`

---

## Step 3: Configure Report Subscriptions

### Add Admin Email for Reports

```sql
-- Daily reports
INSERT INTO scheduled_reports (report_type, recipient_email, enabled)
VALUES ('daily', 'admin@printforge.co', true);

-- Weekly reports
INSERT INTO scheduled_reports (report_type, recipient_email, enabled)
VALUES ('weekly', 'admin@printforge.co', true);
```

### Test Report Generation

Test manually before cron runs:

```bash
curl https://yourdomain.com/api/cron/daily-report \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Check your email for the daily report.

---

## Step 4: Configure Product Costs

### Update Product Costs for Profitability

For each product, add cost information:

```sql
UPDATE products 
SET 
  filament_weight_grams = 100,  -- grams of filament
  estimated_print_hours = 2.5,   -- hours of printing
  estimated_power_cost = 10,     -- rupees
  estimated_packaging_cost = 20, -- rupees
  estimated_total_cost = 35      -- total cost
WHERE id = 'product-uuid';
```

**Or use the service:**

```typescript
import { updateProductCost } from '@/services/profitability';

await updateProductCost('product-uuid', {
  filamentWeightGrams: 100,
  estimatedPrintHours: 2.5,
  estimatedPowerCost: 10,
  estimatedPackagingCost: 20
});
```

---

## Step 5: Test Each Feature

### Feature 8: Profitability

1. Navigate to `/admin/profitability`
2. Should see profitability dashboard
3. Verify profit calculations

**Manual Test:**
```sql
-- Check profitability data
SELECT id, total_amount, total_cost, profit_amount, profit_margin
FROM orders
WHERE payment_status = 'paid'
ORDER BY created_at DESC
LIMIT 5;
```

### Feature 9: Print Farm

**Create test print job:**

```typescript
import { startPrintJob } from '@/services/printFarm';

await startPrintJob('order-uuid', 'Printer-1');
```

**Complete print job:**

```typescript
import { completePrintJob } from '@/services/printFarm';

await completePrintJob('print-job-uuid', 2.5, 95);
```

**Check database:**
```sql
SELECT * FROM print_jobs ORDER BY created_at DESC LIMIT 5;
```

### Feature 10: Reviews

**Test review request:**

```typescript
import { requestReview } from '@/services/reviews';

await requestReview('order-uuid');
```

Check email was sent.

**Submit test review:**

```typescript
import { submitReview } from '@/services/reviews';

await submitReview('user-uuid', 'product-uuid', 'order-uuid', 5, 'Great product!');
```

**Approve review:**

```typescript
import { approveReview } from '@/services/reviews';

await approveReview('review-uuid');
```

**Verify:**
```sql
SELECT * FROM product_reviews ORDER BY created_at DESC LIMIT 5;
```

### Feature 11: Attribution

**Track with UTM:**

```typescript
import { trackEvent } from '@/actions/analytics';

await trackEvent('product_view', {
  productId: 'product-uuid',
  metadata: {
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'summer-sale'
  }
});
```

**Verify:**
```sql
SELECT utm_source, utm_medium, utm_campaign, COUNT(*)
FROM analytics_events
WHERE utm_source IS NOT NULL
GROUP BY utm_source, utm_medium, utm_campaign;
```

### Feature 12: SEO Performance

**Track page view:**

```sql
INSERT INTO page_views (page_url, page_title, is_organic, session_id)
VALUES ('/products/example', 'Product Name', true, 'session-123');
```

**Query performance:**
```sql
SELECT page_url, COUNT(*) as views
FROM page_views
GROUP BY page_url
ORDER BY views DESC
LIMIT 10;
```

### Feature 13: Alerts

**Test alert creation:**

```typescript
import { createAdminAlert } from '@/services/alerts';

await createAdminAlert({
  alertType: 'test',
  severity: 'info',
  title: 'Test Alert',
  message: 'This is a test alert'
});
```

**Verify:**
```sql
SELECT * FROM admin_alerts ORDER BY created_at DESC LIMIT 5;
```

### Feature 14: Lead Follow-up

**Add activity to lead:**

```sql
INSERT INTO lead_activities (lead_id, note, activity_type, created_by)
VALUES ('lead-uuid', 'Called customer', 'call', 'admin-uuid');
```

**Update lead status:**

```sql
UPDATE leads
SET status = 'contacted', contacted_at = NOW()
WHERE id = 'lead-uuid';
```

**Verify:**
```sql
SELECT l.*, COUNT(la.id) as activities
FROM leads l
LEFT JOIN lead_activities la ON la.lead_id = l.id
GROUP BY l.id
ORDER BY l.created_at DESC
LIMIT 10;
```

### Feature 15: Business Health

**Calculate health score:**

```typescript
import { calculateBusinessHealth } from '@/services/businessHealth';

const result = await calculateBusinessHealth();
console.log('Health Score:', result.healthScore);
console.log('Category:', result.healthCategory);
```

**Verify:**
```sql
SELECT * FROM business_health_snapshots
ORDER BY created_at DESC
LIMIT 1;
```

### Feature 16: Reports

**Test daily report:**

```bash
curl https://yourdomain.com/api/cron/daily-report \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Test weekly report:**

```bash
curl https://yourdomain.com/api/cron/weekly-report \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Verify:**
```sql
SELECT * FROM report_history ORDER BY sent_at DESC LIMIT 5;
```

### Feature 17: Exports

**Create export job:**

```sql
INSERT INTO export_jobs (export_type, format, created_by, status)
VALUES ('orders', 'csv', 'admin-uuid', 'pending');
```

**Check status:**
```sql
SELECT * FROM export_jobs ORDER BY created_at DESC LIMIT 5;
```

### Feature 18: Activity Log

**Log admin action:**

```typescript
import { logAdminActivity } from '@/services/adminActivity';

await logAdminActivity({
  adminId: 'admin-uuid',
  action: 'test_action',
  entityType: 'order',
  entityId: 'order-uuid',
  metadata: { test: true }
});
```

**Verify:**
```sql
SELECT * FROM admin_activity_logs ORDER BY created_at DESC LIMIT 10;
```

---

## Step 6: Monitor Cron Jobs

### After First Hour

Check that hourly tasks ran:

```sql
-- Check abandoned carts were marked
SELECT COUNT(*) FROM cart_sessions
WHERE abandoned = true
AND created_at > NOW() - INTERVAL '2 hours';

-- Check alerts were created
SELECT COUNT(*) FROM admin_alerts
WHERE created_at > NOW() - INTERVAL '2 hours';

-- Check business health calculated
SELECT COUNT(*) FROM business_health_snapshots
WHERE created_at > NOW() - INTERVAL '2 hours';
```

### After First Day

Check that daily report sent:

```sql
SELECT * FROM report_history
WHERE report_type = 'daily'
ORDER BY sent_at DESC
LIMIT 1;
```

Check your email for daily report.

### After First Week

Check that weekly report sent:

```sql
SELECT * FROM report_history
WHERE report_type = 'weekly'
ORDER BY sent_at DESC
LIMIT 1;
```

---

## Step 7: Configure Dashboards

### Add Product Costs

Go through each product and add:
- Filament weight (grams)
- Estimated print hours
- Power cost estimate
- Packaging cost
- Total cost calculation

### Set Up Printers

Add your printers to the system for tracking:
```sql
-- Example printer setup (customize for your printers)
-- This is just for reference, printers are tracked via print_jobs
```

### Configure Alert Thresholds

Adjust alert thresholds in code if needed:
- High value order threshold (default: ₹10,000)
- Abandoned cart spike (default: 10 carts/hour)
- Material usage alerts

---

## Step 8: Train Team

### For Admins

**Daily Tasks:**
1. Check admin alerts
2. Review profitability dashboard
3. Monitor print farm
4. Follow up on leads

**Weekly Tasks:**
1. Review weekly report
2. Approve reviews
3. Export data for analysis
4. Check business health score

**Monthly Tasks:**
1. Analyze profitability trends
2. Optimize product costs
3. Review attribution data
4. Audit admin activities

---

## Troubleshooting

### Cron Jobs Not Running

**Check Vercel Logs:**
1. Go to Vercel dashboard
2. Click "Logs"
3. Filter by cron jobs

**Manual Test:**
```bash
curl https://yourdomain.com/api/cron/hourly-tasks \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -v
```

### Reports Not Sending

**Check:**
1. Report subscriptions exist in database
2. Recipient email is valid
3. RESEND_API_KEY is configured
4. Check email_logs for errors

### Profitability Not Calculating

**Ensure:**
1. Product costs are set
2. Orders have items
3. Migration applied correctly

**Recalculate:**
```typescript
import { calculateOrderProfitability } from '@/services/profitability';

// For specific order
await calculateOrderProfitability('order-uuid');
```

### Reviews Not Appearing

**Check:**
1. Reviews are approved
2. Product ID is correct
3. RLS policies allow access

---

## Performance Tuning

### Database Indexes

Already created in migration. Verify:

```sql
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
  'print_jobs',
  'product_reviews',
  'page_views',
  'admin_alerts'
)
ORDER BY tablename, indexname;
```

### Query Optimization

Monitor slow queries:

```sql
-- Enable slow query logging in Supabase dashboard
-- Check for queries > 1 second
```

---

## Security Verification

### RLS Policies

Verify all policies are active:

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'print_jobs',
  'product_reviews',
  'admin_alerts',
  'export_jobs'
)
ORDER BY tablename;
```

### Admin Access

Test that non-admin users can't access:

1. Log in as regular user
2. Try to access `/admin/profitability`
3. Should be redirected or see error

---

## Monitoring Checklist

### Daily

- [ ] Check admin alerts
- [ ] Monitor cron job execution
- [ ] Review email delivery rates
- [ ] Check for database errors

### Weekly

- [ ] Review profitability trends
- [ ] Check print farm performance
- [ ] Monitor review submissions
- [ ] Analyze attribution data

### Monthly

- [ ] Full system health check
- [ ] Review business health score
- [ ] Audit admin activities
- [ ] Plan optimizations

---

## Success Criteria

### Week 1

- ✅ All cron jobs running
- ✅ Reports being sent
- ✅ Alerts being created
- ✅ Profitability calculating

### Month 1

- ✅ 50+ print jobs tracked
- ✅ 10+ reviews collected
- ✅ Business health score stable
- ✅ Attribution data flowing

### Month 3

- ✅ Profitability trends visible
- ✅ Print success rate > 95%
- ✅ Product costs optimized
- ✅ Data-driven decisions made

---

## Rollback Plan

If issues occur:

### Disable Cron Jobs

Remove from `vercel.json`:
```json
{
  "crons": []
}
```

### Revert Migration

```sql
-- Drop new tables (only if necessary)
DROP TABLE IF EXISTS admin_activity_logs;
DROP TABLE IF EXISTS export_jobs;
DROP TABLE IF EXISTS report_history;
DROP TABLE IF EXISTS scheduled_reports;
DROP TABLE IF EXISTS business_health_snapshots;
DROP TABLE IF EXISTS lead_activities;
DROP TABLE IF EXISTS admin_alerts;
DROP TABLE IF EXISTS page_views;
DROP TABLE IF EXISTS product_reviews;
DROP TABLE IF EXISTS print_jobs;

-- Remove added columns (only if necessary)
ALTER TABLE products DROP COLUMN IF EXISTS filament_weight_grams;
ALTER TABLE orders DROP COLUMN IF EXISTS material_cost;
ALTER TABLE analytics_events DROP COLUMN IF EXISTS utm_source;
```

---

## Support

### Common Issues

**Issue:** Profitability shows zero
**Solution:** Add product costs first

**Issue:** No alerts appearing
**Solution:** Wait for conditions to trigger or create manually

**Issue:** Reports not sending
**Solution:** Check scheduled_reports table has entries

**Issue:** Cron jobs unauthorized
**Solution:** Verify CRON_SECRET matches in env and requests

---

## Final Checklist

Before going live:

- [ ] Migration 009 applied successfully
- [ ] All tables created
- [ ] All columns added
- [ ] All functions created
- [ ] RLS policies active
- [ ] Cron jobs scheduled
- [ ] Product costs configured
- [ ] Report subscriptions added
- [ ] All features tested manually
- [ ] Admin team trained
- [ ] Monitoring set up
- [ ] Documentation reviewed

---

## Congratulations! 🎉

You've successfully deployed all **19 features** of the PrintForge Growth Platform!

Your business now has:
✅ Complete profitability tracking
✅ Print farm operations
✅ Customer review system
✅ Marketing attribution
✅ SEO performance tracking
✅ Admin alert center
✅ Lead follow-up system
✅ Business health scoring
✅ Automated reporting
✅ Data export capabilities
✅ Full admin audit trail

**Ready to scale! 🚀**

---

*Deployment Date:* _______________
*Deployed By:* _______________
*Version:* 2.0 (Complete Platform)
