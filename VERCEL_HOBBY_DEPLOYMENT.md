# Vercel Hobby Plan Deployment Guide

## ✅ What's Fixed

Updated `vercel.json` to comply with Vercel Hobby plan limits (daily crons only):

```json
{
  "crons": [
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

---

## 🚀 Quick Deploy

```bash
# Commit the changes
git add vercel.json
git commit -m "Fix: Update cron jobs for Vercel Hobby plan"
git push

# Deploy
vercel --prod
```

---

## ⏰ Hourly Tasks Setup (5 minutes)

Since Vercel Hobby doesn't support hourly crons, use **cron-job.org** (free):

### Steps:

1. **Go to [cron-job.org](https://cron-job.org/en/)** and sign up (free)

2. **Create Cronjob:**
   - Title: `PrintForge Hourly Tasks`
   - URL: `https://your-domain.vercel.app/api/cron/hourly-tasks`
   - Schedule: Select "Every 1 hour"

3. **Add Authorization Header:**
   - Go to "Advanced" tab
   - Add header:
     - Key: `Authorization`
     - Value: `Bearer YOUR_CRON_SECRET`

4. **Save and Test:**
   - Click "Create cronjob"
   - Click "Execute now" to test

**Done!** ✅

---

## 📊 What Each Cron Does

### Hourly Tasks (cron-job.org)
- Mark abandoned carts
- Send recovery emails
- Retry failed emails
- Check for alerts
- Calculate business health

### Daily Report (Vercel)
- Revenue, orders, conversions
- Sent at 9 AM daily

### Weekly Report (Vercel)
- Best/worst products
- Customer growth
- Sent at 9 AM Monday

---

## 🔐 Security

Make sure `CRON_SECRET` is set:

```bash
# Generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to Vercel:
# Project → Settings → Environment Variables
# Key: CRON_SECRET
# Value: [paste generated secret]
```

---

## ✅ Verification

### Test Hourly Tasks:
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.vercel.app/api/cron/hourly-tasks
```

### Check Database:
```sql
-- Abandoned carts processed?
SELECT COUNT(*) FROM cart_sessions 
WHERE abandoned = true 
AND created_at > NOW() - INTERVAL '2 hours';

-- Alerts created?
SELECT * FROM admin_alerts 
ORDER BY created_at DESC LIMIT 5;

-- Health score calculated?
SELECT * FROM business_health_snapshots 
ORDER BY created_at DESC LIMIT 1;
```

---

## 💰 Cost

**Current Setup: $0/month**
- ✅ Vercel Hobby: Free
- ✅ cron-job.org: Free
- ✅ Supabase: Free tier
- ✅ Resend: Free tier (3,000 emails/month)

**To Upgrade:**
- Vercel Pro ($20/month) → Get hourly crons built-in
- Worth it for production with high traffic

---

## 📖 Full Documentation

- **CRON_SETUP_FREE.md** - Detailed cron setup guide
- **ADVANCED_FEATURES_DEPLOYMENT.md** - Complete deployment guide
- **COMPLETE_PLATFORM_README.md** - Full platform overview

---

## ✨ You're All Set!

1. ✅ Vercel deployment fixed for Hobby plan
2. ✅ Daily/weekly reports will run automatically
3. ✅ Set up cron-job.org for hourly tasks (5 min)
4. ✅ All features working on free tier

**Ready to deploy and grow your business!** 🚀
