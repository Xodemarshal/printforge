# Password Reset Domain Fix

## Problem
The "forgot password" functionality is still using `theorigin.site` instead of `archivevault.in`.

## Root Causes Identified

### 1. Environment Variables
- `.env.copy` file had wrong domain settings:
  - `EMAIL_FROM=ArchiveVault <noreply@theorigin.site>` (FIXED)
  - `RESEND_DOMAIN=theorigin.site` (FIXED)

### 2. Application URL Configuration
- `NEXT_PUBLIC_APP_URL` is set to `http://localhost:3000` in both `.env.local` and `.env.copy`
- In production, this should be set to `https://archivevault.in`

### 3. Supabase Configuration
- Supabase dashboard needs to be configured with the correct site URL for password reset emails

## Fixes Applied

### 1. Updated `.env.copy` file:
- Changed `EMAIL_FROM` from `theorigin.site` to `archivevault.in`
- Changed `RESEND_DOMAIN` from `theorigin.site` to `archivevault.in`

### 2. Production Environment Variables Needed:
In Vercel production environment, set:
```
NEXT_PUBLIC_APP_URL=https://archivevault.in
```

### 3. Supabase Dashboard Configuration:
1. Log into Supabase dashboard
2. Go to Authentication → URL Configuration
3. Set "Site URL" to `https://archivevault.in`
4. Save changes

## How Password Reset Works

1. User requests password reset at `/forgot-password`
2. App calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: `${appUrl}/reset-password` })`
3. `appUrl` comes from `getAppUrl()` function which checks:
   - `NEXT_PUBLIC_APP_URL` environment variable
   - `VERCEL_URL` environment variable (auto-set by Vercel)
   - Request headers (fallback)

## Testing

After applying fixes:
1. Request password reset in production
2. Check email received
3. Verify reset link points to `https://archivevault.in/reset-password`
4. Test that password reset works correctly