# Free Cron Job Setup Guide (Vercel Hobby Plan)

Since Vercel Hobby plan only allows daily cron jobs, we'll use free external services for hourly tasks.

---

## What's Configured

### ✅ Vercel Cron (Daily Jobs)
- Daily report: 9 AM every day
- Weekly report: 9 AM every Monday

### ⏰ Need External Service (Hourly Jobs)
- Hourly tasks (abandoned carts, alerts, health score)

---

## Option 1: cron-job.org (Recommended - Free Forever)

### Setup Steps:

1. **Sign up at [cron-job.org](https://cron-job.org/en/)**
   - Free forever
   - No credit card required
   - Up to 50 cron jobs

2. **Create Cron Job**
   - Click "Create Cronjob"
   - **Title:** PrintForge Hourly Tasks
   - **URL:** `https://your-domain.vercel.app/api/cron/hourly-tasks`
   - **Schedule:** Every hour (select "Every 1 hour")
   - **Execution:** Click "Advanced" tab
   - **Add Header:**
     - Key: `Authorization`
     - Value: `Bearer YOUR_CRON_SECRET` (use your actual secret from .env)

3. **Save and Test**
   - Click "Create cronjob"
   - Click "Execute now" to test

---

## Option 2: EasyCron (Free Tier)

### Setup Steps:

1. **Sign up at [easycron.com](https://www.easycron.com/)**
   - Free tier: Up to 1 cron job
   - Perfect for our needs

2. **Create Cron Job**
   - **Cron Job Name:** PrintForge Hourly Tasks
   - **URL:** `https://your-domain.vercel.app/api/cron/hourly-tasks`
   - **Cron Expression:** `0 * * * *` (every hour)
   - **HTTP Header:** 
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```

3. **Enable and Test**

---

## Option 3: GitHub Actions (Free)

Create `.github/workflows/hourly-cron.yml`:

```yaml
name: Hourly Cron Tasks

on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:  # Allow manual trigger

jobs:
  run-hourly-tasks:
    runs-on: ubuntu-latest
    steps:
      - name: Call Hourly Tasks API
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-domain.vercel.app/api/cron/hourly-tasks
```

**Setup:**
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add secret: `CRON_SECRET` with your value
4. Commit the workflow file
5. GitHub will run it hourly automatically

---

## Option 4: Render Cron Jobs (Free)

1. Sign up at [render.com](https://render.com)
2. Create a "Cron Job"
3. Set schedule: `0 * * * *`
4. Set command:
   ```bash
   curl -X GET \
     -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://your-domain.vercel.app/api/cron/hourly-tasks
   ```

---

## Option 5: Manual Alternative (Until You Upgrade)

If you don't want to set up external cron now, you can:

1. **Manually trigger hourly tasks** from admin dashboard (create a button)
2. **Run once per day** instead of hourly (change the endpoint logic)
3. **Upgrade to Vercel Pro** ($20/month) for built-in hourly crons

---

## Quick Test

Test your cron endpoint manually:

```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.vercel.app/api/cron/hourly-tasks
```

Expected response:
```json
{
  "success": true,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "results": {
    "carts": { "success": true, "marked": 5, "emailsSent": 3 },
    "emails": { "success": true, "retried": 2 },
    "alerts": { "success": true },
    "health": { "success": true, "healthScore": 75 }
  }
}
```

---

## What Each Service Does

### Hourly Tasks (`/api/cron/hourly-tasks`):
- ✅ Mark abandoned carts (>1 hour inactive)
- ✅ Send abandoned cart recovery emails
- ✅ Retry failed emails
- ✅ Check alert conditions (failed payments, cart spikes, etc.)
- ✅ Calculate business health score

### Daily Report (`/api/cron/daily-report`):
- ✅ Generate daily business report
- ✅ Send to subscribed admins
- ✅ Track in report history

### Weekly Report (`/api/cron/weekly-report`):
- ✅ Generate weekly business summary
- ✅ Send to subscribed admins
- ✅ Include trend analysis

---

## Recommended: cron-job.org

**Why it's best for this use case:**
- ✅ Free forever
- ✅ Reliable (99.9% uptime)
- ✅ Easy to set up
- ✅ Good monitoring dashboard
- ✅ Email notifications on failures
- ✅ No code changes needed

---

## Environment Variable Needed

Make sure `CRON_SECRET` is set in your Vercel environment:

1. Go to Vercel Dashboard
2. Your Project → Settings → Environment Variables
3. Add: `CRON_SECRET` = `your-secure-random-string`
4. Redeploy

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Monitoring

### Check Cron Execution:

**In Database:**
```sql
-- Check recent abandoned cart processing
SELECT COUNT(*) 
FROM cart_sessions 
WHERE abandoned = true 
AND created_at > NOW() - INTERVAL '2 hours';

-- Check recent alerts
SELECT * 
FROM admin_alerts 
WHERE created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC;

-- Check business health snapshots
SELECT * 
FROM business_health_snapshots 
WHERE created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC;
```

**In Vercel Logs:**
- Go to your project
- Click "Logs"
- Filter by function: `/api/cron/`

---

## Troubleshooting

### "Unauthorized" Error
- Check `CRON_SECRET` matches in Vercel env and your cron service
- Make sure header format is: `Authorization: Bearer YOUR_SECRET`

### Cron Not Running
- Check service is enabled
- Verify URL is correct (include https://)
- Test manually with curl first

### No Changes in Database
- Check Vercel logs for errors
- Verify database connection
- Check RLS policies allow inserts

---

## Cost Comparison

| Service | Free Tier | Hourly Crons | Notes |
|---------|-----------|--------------|-------|
| cron-job.org | ✅ Forever | ✅ Yes | Best option |
| EasyCron | ✅ 1 job | ✅ Yes | Simple setup |
| GitHub Actions | ✅ 2000 min/month | ✅ Yes | Good for GitHub users |
| Render | ✅ Limited | ✅ Yes | More complex |
| Vercel Pro | ❌ $20/month | ✅ Yes | Native integration |

---

## Recommendation

**For Production:**
1. Use **cron-job.org** for hourly tasks (free, reliable)
2. Use **Vercel Cron** for daily/weekly reports (already configured)
3. Monitor both regularly

**For Enterprise:**
- Upgrade to Vercel Pro
- All crons managed in one place
- Better integration and monitoring

---

## Setup Checklist

- [ ] Vercel deployed successfully
- [ ] `CRON_SECRET` set in Vercel environment
- [ ] cron-job.org account created
- [ ] Hourly task cron configured
- [ ] Authorization header added
- [ ] Test run successful
- [ ] Database shows results
- [ ] Monitoring set up

---

## Next Steps

1. Deploy to Vercel (daily/weekly crons will work automatically)
2. Set up cron-job.org for hourly tasks (5 minutes)
3. Test all three endpoints
4. Monitor for 24 hours
5. Done! ✅

---

**Your cron setup is now production-ready on Vercel Hobby plan!** 🎉

The combination of Vercel's daily crons + cron-job.org's hourly crons gives you a completely free, reliable solution.
