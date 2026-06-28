# 🗺️ Navigation Guide - Where Everything Is

## 📍 Current Admin Navigation (Existing)

These pages are **already accessible** in the admin sidebar:

| Menu Item | URL | Status | Purpose |
|-----------|-----|--------|---------|
| Dashboard | `/admin/dashboard` | ✅ Working | Main overview |
| Requests | `/admin/print-queue` | ✅ Working | STL upload requests |
| Products | `/admin/products` | ✅ Working | Product management |
| Categories | `/admin/categories` | ✅ Working | Category management |
| Orders | `/admin/orders` | ✅ Working | Order management |
| Shipping | `/admin/shipping/not-picked-up` | ✅ Working | Shiprocket tracking |
| Inventory | `/admin/inventory` | ✅ Working | Material inventory |
| Coupons | `/admin/coupons` | ✅ Working | Coupon codes |
| Reviews | `/admin/reviews` | ✅ Working | Old review system |
| Analytics | `/admin/analytics` | ✅ Working | Analytics dashboard |
| Settings | `/admin/settings` | ✅ Working | Site settings |

---

## 🆕 New Admin Pages (Hidden - Not in Navigation)

These pages **exist and work** but aren't in the sidebar menu:

### Working Pages (Backend Complete)

| Page | URL | Status | Purpose |
|------|-----|--------|---------|
| **Profitability** | `/admin/profitability` | ✅ **WORKING** | Profit tracking by product/order |
| **Leads** | `/admin/leads` | ✅ **WORKING** | Lead management dashboard |

### Pages Needing Creation

| Page | URL | Status | What's Missing |
|------|-----|--------|----------------|
| **Print Farm** | `/admin/print-farm` | ⚠️ No UI | Backend ready, needs page |
| **Product Reviews** | `/admin/product-reviews` | ⚠️ No UI | Backend ready, needs page |
| **Alert Center** | `/admin/alerts` | ⚠️ No UI | Backend ready, needs page |
| **Business Health** | `/admin/health` | ⚠️ No UI | Backend ready, needs page |
| **Reports** | `/admin/reports` | ⚠️ No UI | Backend ready, needs page |
| **Activity Log** | `/admin/activity-log` | ⚠️ No UI | Backend ready, needs page |
| **SEO Dashboard** | `/admin/seo` | ⚠️ No UI | Backend ready, needs page |
| **Exports** | `/admin/exports` | ⚠️ No UI | Backend ready, needs page |

---

## 🔧 How to Add Missing Pages to Navigation

### Step 1: Update Constants

Edit `src/lib/constants.ts`:

```typescript
export const ADMIN_NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/print-queue", label: "Requests" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/shipping/not-picked-up", label: "Shipping" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/analytics", label: "Analytics" },
  
  // 🆕 Add these new pages:
  { href: "/admin/profitability", label: "Profitability" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/print-farm", label: "Print Farm" },
  { href: "/admin/product-reviews", label: "Product Reviews" },
  { href: "/admin/alerts", label: "Alerts" },
  { href: "/admin/health", label: "Business Health" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/activity-log", label: "Activity Log" },
  
  { href: "/admin/settings", label: "Settings" }
];
```

### Step 2: Update Sidebar Icons

Edit `src/components/layout/AdminSidebar.tsx`:

```typescript
import {
  TreePine,
  LayoutDashboard,
  Sparkles,
  Package,
  FolderTree,
  ShoppingBag,
  Warehouse,
  Ticket,
  Star,
  BarChart3,
  Settings,
  // 🆕 Add these icons:
  DollarSign,      // Profitability
  Users,           // Leads
  Printer,         // Print Farm
  MessageSquare,   // Product Reviews
  Bell,            // Alerts
  Activity,        // Business Health
  FileText,        // Reports
  Shield           // Activity Log
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ size?: number | string }>> = {
  Dashboard: LayoutDashboard,
  Requests: Sparkles,
  Products: Package,
  Categories: FolderTree,
  Orders: ShoppingBag,
  Shipping: ShoppingBag,
  Inventory: Warehouse,
  Coupons: Ticket,
  Reviews: Star,
  Analytics: BarChart3,
  
  // 🆕 Add these mappings:
  Profitability: DollarSign,
  Leads: Users,
  "Print Farm": Printer,
  "Product Reviews": MessageSquare,
  Alerts: Bell,
  "Business Health": Activity,
  Reports: FileText,
  "Activity Log": Shield,
  
  Settings: Settings
};
```

---

## 📊 What Each Action File Does

### 1. `src/actions/profitability.ts`
**Used in**: `/admin/profitability` (✅ Working)

**What it does**:
- Calculate order profitability
- Update product costs
- Get profitability reports

**How to use**:
- Already integrated in profitability dashboard
- Can add cost editing forms to product pages

### 2. `src/actions/printFarm.ts`
**Used in**: `/admin/print-farm` (⚠️ Needs UI)

**What it does**:
- Start print jobs
- Complete print jobs
- Fail print jobs
- Get active jobs
- Get print statistics

**How to use**:
```typescript
import { startPrintJobAction, completePrintJobAction } from '@/actions/printFarm';

// In print farm dashboard page
<form action={startPrintJobAction}>
  <input name="orderId" value={order.id} />
  <input name="printerName" value="Printer-1" />
  <button type="submit">Start Print</button>
</form>
```

### 3. `src/actions/productReviews.ts`
**Used in**: `/admin/product-reviews` (⚠️ Needs UI)

**What it does**:
- Submit reviews (customer)
- Approve reviews (admin)
- Request reviews (admin)

**How to use**:
```typescript
import { approveProductReviewAction } from '@/actions/productReviews';

// In admin reviews page
<button onClick={() => approveProductReviewAction(reviewId)}>
  Approve
</button>
```

### 4. `src/actions/adminAlerts.ts`
**Used in**: `/admin/alerts` (⚠️ Needs UI)

**What it does**:
- Create manual alerts
- Mark alerts as read
- Resolve alerts
- Get unread count

**How to use**:
```typescript
import { getUnreadAlertsCountAction } from '@/actions/adminAlerts';

// In header notification bell
const count = await getUnreadAlertsCountAction();
<Bell />
{count > 0 && <Badge>{count}</Badge>}
```

### 5. `src/actions/businessHealth.ts`
**Used in**: `/admin/health` (⚠️ Needs UI)

**What it does**:
- Calculate current health score
- Get latest health snapshot
- Get health trend over time

**How to use**:
```typescript
import { getLatestBusinessHealthAction } from '@/actions/businessHealth';

// In health dashboard
const health = await getLatestBusinessHealthAction();
<HealthScore score={health.health_score} category={health.health_category} />
```

### 6. `src/actions/reports.ts`
**Used in**: `/admin/reports` (⚠️ Needs UI)

**What it does**:
- Generate daily/weekly reports
- Subscribe to reports
- Send reports manually
- Unsubscribe from reports

**How to use**:
```typescript
import { subscribeToReportsAction } from '@/actions/reports';

// In reports management page
<form action={subscribeToReportsAction}>
  <input name="email" type="email" />
  <select name="reportType">
    <option value="daily">Daily</option>
    <option value="weekly">Weekly</option>
  </select>
  <button type="submit">Subscribe</button>
</form>
```

### 7. `src/actions/adminActivity.ts`
**Used in**: `/admin/activity-log` (⚠️ Needs UI)

**What it does**:
- Log admin activities (automatic)
- Get activity logs with filters
- Search activity logs
- Get activity statistics

**How to use**:
```typescript
import { getAdminActivityLogsAction } from '@/actions/adminActivity';

// In activity log viewer
const { data: logs } = await getAdminActivityLogsAction({
  limit: 50,
  startDate: '2024-01-01'
});

// Logs are automatically created when admins:
// - Update orders
// - Edit products
// - Change settings
// - Send emails manually
```

---

## 🎯 Quick Access URLs

You can access these pages **directly** by typing the URL:

### ✅ Working Now (Just type in browser):
- `http://localhost:3000/admin/profitability` - Profitability dashboard
- `http://localhost:3000/admin/leads` - Leads management
- `http://localhost:3000/admin/analytics` - Analytics dashboard

### ⚠️ Will 404 (Need UI creation):
- `http://localhost:3000/admin/print-farm`
- `http://localhost:3000/admin/product-reviews`
- `http://localhost:3000/admin/alerts`
- `http://localhost:3000/admin/health`
- `http://localhost:3000/admin/reports`
- `http://localhost:3000/admin/activity-log`

---

## 🚀 Quick Win: Add Working Pages to Navigation

**Minimum change to see immediate value:**

Update `src/lib/constants.ts`:

```typescript
export const ADMIN_NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/print-queue", label: "Requests" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/shipping/not-picked-up", label: "Shipping" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/profitability", label: "Profitability" }, // 🆕 ADD THIS
  { href: "/admin/leads", label: "Leads" },                 // 🆕 ADD THIS
  { href: "/admin/settings", label: "Settings" }
];
```

**Result**: Profitability and Leads will appear in sidebar! ✅

---

## 📝 Summary

### ✅ Pages You Can Use Right Now:
1. **Profitability** - Track profit by product/order
2. **Leads** - Manage customer leads
3. **Analytics** - View business metrics

Just add them to navigation constants!

### ⚠️ Pages That Need UI:
4. Print Farm - Track print jobs
5. Product Reviews - Manage product reviews
6. Alerts - View and manage alerts
7. Business Health - View health score
8. Reports - Manage report subscriptions
9. Activity Log - View admin audit trail

Backend is ready, just need to create the page files!

### 🎯 Recommended Order:
1. **Add to navigation** - Profitability & Leads (1 min)
2. **Create Alert Center** - High value, shows alerts (30 min)
3. **Create Print Farm** - Track operations (45 min)
4. **Create Product Reviews** - Social proof (30 min)
5. **Create Business Health** - Single score overview (30 min)
6. **Create Reports** - Configure automation (30 min)
7. **Create Activity Log** - Audit trail (30 min)

---

**All backend actions are ready to use - they just need UI pages to expose them!** 🎉
