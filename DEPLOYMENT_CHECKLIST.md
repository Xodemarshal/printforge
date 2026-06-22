# PrintForge Growth Platform - Deployment Checklist

## Pre-Deployment

### 1. Environment Variables ✓

**Required Variables:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `RAZORPAY_KEY_ID`
- [ ] `RAZORPAY_KEY_SECRET`
- [ ] `RESEND_API_KEY`
- [ ] `EMAIL_FROM`
- [ ] `WHATSAPP_NUMBER`
- [ ] `NEXT_PUBLIC_WHATSAPP_NUMBER`
- [ ] `CRON_SECRET`

### 2. Database Migration ✓

- [ ] Run migration `008_complete_growth_platform.sql`
- [ ] Verify all tables created:
  - [ ] `email_logs`
  - [ ] `customers`
  - [ ] `cart_sessions`
  - [ ] `leads`
- [ ] Verify columns added to `analytics_events`
- [ ] Test database functions:
  - [ ] `get_product_performance`
  - [ ] `get_conversion_funnel`
  - [ ] `get_revenue_stats`
- [ ] Verify RLS policies are active

### 3. Email Configuration ✓

- [ ] Sign up for Resend account
- [ ] Add and verify domain
- [ ] Get API key
- [ ] Test email sending
- [ ] Update `EMAIL_FROM` with verified domain

### 4. WhatsApp Setup ✓

- [ ] Get WhatsApp Business number
- [ ] Format correctly (+country code + number)
- [ ] Test WhatsApp links open correctly
- [ ] Add number to environment variables

### 5. Code Integration ✓

- [ ] WhatsApp floating button added to public layout
- [ ] Analytics tracking added to:
  - [ ] Product pages (`trackProductView`)
  - [ ] Cart operations (`trackAddToCart`)
  - [ ] Checkout flow (`trackCheckoutStarted`)
- [ ] Cart session tracking in checkout flow
- [ ] Email sending in checkout actions

## Deployment

### 6. Build & Deploy ✓

- [ ] Run `npm run build` locally to test
- [ ] Fix any TypeScript errors
- [ ] Fix any build warnings
- [ ] Deploy to production (Vercel/hosting)
- [ ] Verify deployment successful

### 7. Cron Jobs Setup ✓

**Option A: Vercel Cron**
- [ ] Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/abandoned-carts",
    "schedule": "0 * * * *"
  }]
}
```

**Option B: External Cron Service**
- [ ] Set up cron job to hit `/api/cron/abandoned-carts`
- [ ] Pass `Authorization: Bearer {CRON_SECRET}` header
- [ ] Schedule hourly execution

### 8. Smoke Tests ✓

- [ ] Place a test order (COD)
  - [ ] Verify order confirmation email received
  - [ ] Check `email_logs` table
  - [ ] Check `customers` table updated
- [ ] Place a test order (Razorpay)
  - [ ] Verify payment flow
  - [ ] Verify email after payment success
  - [ ] Check customer data linked
- [ ] Test WhatsApp buttons:
  - [ ] Floating button
  - [ ] Product inquiry button
  - [ ] Order inquiry button
- [ ] Verify analytics tracking:
  - [ ] Product view tracked
  - [ ] Add to cart tracked
  - [ ] Check `analytics_events` table
- [ ] Test cart abandonment:
  - [ ] Add items to cart
  - [ ] Wait 1 hour or manually trigger
  - [ ] Verify recovery email sent

### 9. Admin Dashboard Access ✓

- [ ] Navigate to `/admin/analytics`
- [ ] Verify data displays correctly
- [ ] Test date filters (7, 30, 90 days)
- [ ] Verify all metrics calculate correctly:
  - [ ] Total Revenue
  - [ ] Conversion Rate
  - [ ] Abandoned Carts
  - [ ] Product Performance
  - [ ] Top Customers

## Post-Deployment

### 10. Monitoring Setup ✓

- [ ] Set up error alerting (Sentry, etc.)
- [ ] Monitor email delivery rate in Resend
- [ ] Track database query performance
- [ ] Monitor API response times
- [ ] Set up uptime monitoring

### 11. Analytics Verification ✓

**Week 1:**
- [ ] Verify analytics events collecting properly
- [ ] Check email delivery rates > 95%
- [ ] Monitor cart abandonment rates
- [ ] Track WhatsApp click-through rates

**Week 2:**
- [ ] Review product performance data
- [ ] Analyze conversion funnel
- [ ] Check customer segmentation
- [ ] Review recovered cart revenue

### 12. Customer Communication ✓

- [ ] Announce WhatsApp support to customers
- [ ] Update website with WhatsApp number
- [ ] Add email support information
- [ ] Train support team on new features

### 13. Optimization ✓

**After 30 Days:**
- [ ] Review email open rates
- [ ] A/B test email subject lines
- [ ] Optimize abandoned cart email timing
- [ ] Analyze most effective WhatsApp messages
- [ ] Review product interest scores
- [ ] Identify top conversion opportunities

## Security Checklist ✓

- [ ] All admin routes protected with `requireAdmin()`
- [ ] RLS policies active on all tables
- [ ] API routes validate authentication
- [ ] Cron endpoints secured with secret
- [ ] Input validation on all forms
- [ ] Rate limiting on public endpoints
- [ ] CSRF protection enabled
- [ ] No sensitive data in client-side code
- [ ] Environment variables not committed to git

## Performance Checklist ✓

- [ ] Database indexes created
- [ ] Analytics queries optimized
- [ ] Image optimization enabled
- [ ] API routes cached where appropriate
- [ ] Static pages generated
- [ ] Lazy loading for heavy components
- [ ] Bundle size analyzed and optimized

## Compliance Checklist ✓

### GDPR
- [ ] Privacy policy updated
- [ ] Cookie consent implemented
- [ ] Data collection disclosed
- [ ] User data export available
- [ ] User data deletion available
- [ ] Email unsubscribe links

### CAN-SPAM
- [ ] Physical address in email footer
- [ ] Unsubscribe link in emails
- [ ] Unsubscribe processed within 10 days
- [ ] Subject lines not deceptive

### WhatsApp Business Policy
- [ ] Using business account
- [ ] Not sending unsolicited messages
- [ ] Opt-in mechanism for WhatsApp marketing
- [ ] Response within 24 hours

## Rollback Plan

### If Issues Occur:

1. **Email Problems:**
   - Revert to previous checkout action
   - Disable email sending temporarily
   - Fix and redeploy

2. **Analytics Issues:**
   - Analytics service independent
   - Can disable without affecting orders
   - Fix and redeploy

3. **Database Issues:**
   - Keep backup of previous schema
   - Restore previous migration
   - Fix issues and remigrate

4. **WhatsApp Button Issues:**
   - Hide button via CSS
   - Fix component
   - Redeploy

## Success Metrics

### Month 1 Targets:
- Email delivery rate > 95%
- Cart abandonment < 70%
- Cart recovery rate > 10%
- WhatsApp engagement > 5%
- Conversion rate improvement > 5%

### Month 3 Targets:
- Cart recovery rate > 15%
- Email open rate > 30%
- WhatsApp conversion > 10%
- Customer retention > 25%
- Revenue increase > 15%

## Support Contacts

**Technical Issues:**
- Database: Supabase Support
- Email: Resend Support
- Hosting: Vercel Support

**Emergency Contacts:**
- [ ] Add DevOps contact
- [ ] Add Backend lead contact
- [ ] Add Product owner contact

## Documentation

- [ ] Update internal wiki
- [ ] Document cron job schedule
- [ ] Document email templates
- [ ] Document analytics events
- [ ] Create admin user guide
- [ ] Create support team guide

## Sign-Off

- [ ] Technical Lead Approval
- [ ] Product Owner Approval
- [ ] QA Sign-off
- [ ] Security Review Complete
- [ ] Performance Review Complete

---

**Deployment Date:** _________________

**Deployed By:** _________________

**Version:** _________________

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
