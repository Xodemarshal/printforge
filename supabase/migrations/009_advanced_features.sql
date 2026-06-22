-- 009_advanced_features.sql
-- Features 8-18: Profitability, Operations, Reviews, Attribution, SEO, Alerts, Follow-up, Health Score, Reports, Export, Audit Log

-- ============================================
-- FEATURE 8: PROFITABILITY ENGINE
-- ============================================

-- Add cost tracking to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS filament_weight_grams INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS estimated_print_hours NUMERIC(5,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS estimated_power_cost NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS estimated_packaging_cost NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS estimated_total_cost NUMERIC(10,2) DEFAULT 0;

-- Add profit tracking to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS material_cost NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS print_cost NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS packaging_cost NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_cost NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS profit_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS profit_margin NUMERIC(5,2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_orders_profit ON public.orders(profit_amount DESC);
CREATE INDEX IF NOT EXISTS idx_products_profit_margin ON public.products(estimated_total_cost, price);

-- ============================================
-- FEATURE 9: PRINT FARM OPERATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.print_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  printer_name TEXT NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  actual_print_hours NUMERIC(5,2),
  filament_used_grams INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_print_jobs_order_id ON public.print_jobs(order_id);
CREATE INDEX IF NOT EXISTS idx_print_jobs_printer ON public.print_jobs(printer_name);
CREATE INDEX IF NOT EXISTS idx_print_jobs_started ON public.print_jobs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_print_jobs_failed ON public.print_jobs(failed) WHERE failed = true;

-- ============================================
-- FEATURE 10: CUSTOMER REVIEW SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.product_reviews(product_id, approved);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON public.product_reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order ON public.product_reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.product_reviews(rating DESC);

-- ============================================
-- FEATURE 11: MARKETING ATTRIBUTION
-- ============================================

-- Add UTM tracking to analytics events
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS utm_content TEXT;

CREATE INDEX IF NOT EXISTS idx_analytics_utm_source ON public.analytics_events(utm_source);
CREATE INDEX IF NOT EXISTS idx_analytics_utm_campaign ON public.analytics_events(utm_campaign);

-- Add UTM tracking to leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_content TEXT;

-- Add UTM tracking to customers
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- Add attribution to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- ============================================
-- FEATURE 12: SEO PERFORMANCE DASHBOARD
-- ============================================

CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  session_id TEXT,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_organic BOOLEAN DEFAULT false,
  is_bounce BOOLEAN DEFAULT false,
  time_on_page INTEGER, -- seconds
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_page_views_url ON public.page_views(page_url);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_organic ON public.page_views(is_organic) WHERE is_organic = true;

-- ============================================
-- FEATURE 13: ADMIN ALERT CENTER
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.admin_alerts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.admin_alerts(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON public.admin_alerts(alert_type);

-- ============================================
-- FEATURE 14: LEAD FOLLOW-UP SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('note', 'call', 'email', 'whatsapp', 'meeting', 'other')),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON public.lead_activities(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_by ON public.lead_activities(created_by);

-- Add status to leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open' CHECK (status IN ('open', 'contacted', 'qualified', 'converted', 'lost'));
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lost_at TIMESTAMPTZ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lost_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status, created_at DESC);

-- ============================================
-- FEATURE 15: BUSINESS HEALTH SCORE
-- ============================================

CREATE TABLE IF NOT EXISTS public.business_health_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  health_category TEXT NOT NULL CHECK (health_category IN ('critical', 'warning', 'good', 'excellent')),
  revenue_growth_score INTEGER,
  conversion_rate_score INTEGER,
  customer_retention_score INTEGER,
  review_rating_score INTEGER,
  cart_recovery_score INTEGER,
  profit_margin_score INTEGER,
  metrics JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_health_snapshots_created ON public.business_health_snapshots(created_at DESC);

-- ============================================
-- FEATURE 16: AUTOMATED BUSINESS REPORTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly')),
  recipient_email TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  report_data JSONB NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_report_history_type ON public.report_history(report_type, sent_at DESC);

-- ============================================
-- FEATURE 17: EXPORT & BACKUP CENTER
-- ============================================

CREATE TABLE IF NOT EXISTS public.export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_type TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('csv', 'excel', 'json')),
  filters JSONB,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_export_jobs_created_by ON public.export_jobs(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON public.export_jobs(status);

-- ============================================
-- FEATURE 18: ADMIN ACTIVITY LOG
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON public.admin_activity_logs(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_entity ON public.admin_activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON public.admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON public.admin_activity_logs(action);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Print jobs (admin only)
ALTER TABLE public.print_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage print jobs" ON public.print_jobs FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Product reviews (users can view approved, admin can manage all)
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved reviews" ON public.product_reviews FOR SELECT TO anon, authenticated USING (approved = true);
CREATE POLICY "Users can create reviews" ON public.product_reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own reviews" ON public.product_reviews FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can manage all reviews" ON public.product_reviews FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Page views (anyone can insert, admin can view)
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can track page views" ON public.page_views FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin can view page views" ON public.page_views FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Admin alerts (admin only)
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage alerts" ON public.admin_alerts FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Lead activities (admin only)
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage lead activities" ON public.lead_activities FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Business health snapshots (admin only)
ALTER TABLE public.business_health_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view health snapshots" ON public.business_health_snapshots FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Scheduled reports (admin only)
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage reports" ON public.scheduled_reports FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Report history (admin only)
ALTER TABLE public.report_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view report history" ON public.report_history FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Export jobs (users can see their own, admin can see all)
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own exports" ON public.export_jobs FOR SELECT TO authenticated USING (
  created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can create exports" ON public.export_jobs FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

-- Admin activity logs (admin only)
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view activity logs" ON public.admin_activity_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can create activity logs" ON public.admin_activity_logs FOR INSERT TO authenticated WITH CHECK (
  admin_id = auth.uid() AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Calculate business health score
CREATE OR REPLACE FUNCTION public.calculate_business_health_score()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  revenue_score INTEGER := 0;
  conversion_score INTEGER := 0;
  retention_score INTEGER := 0;
  review_score INTEGER := 0;
  recovery_score INTEGER := 0;
  profit_score INTEGER := 0;
  total_score INTEGER := 0;
BEGIN
  -- Revenue growth (20 points)
  SELECT CASE 
    WHEN revenue_growth > 20 THEN 20
    WHEN revenue_growth > 10 THEN 15
    WHEN revenue_growth > 5 THEN 10
    WHEN revenue_growth >= 0 THEN 5
    ELSE 0
  END INTO revenue_score
  FROM (
    SELECT COALESCE(
      ((SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN total_amount ELSE 0 END) -
        SUM(CASE WHEN created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days' THEN total_amount ELSE 0 END)) /
        NULLIF(SUM(CASE WHEN created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days' THEN total_amount ELSE 0 END), 0)) * 100,
      0
    ) as revenue_growth
    FROM orders WHERE payment_status = 'paid'
  ) rg;
  
  -- Conversion rate (20 points)
  SELECT CASE 
    WHEN conv_rate > 5 THEN 20
    WHEN conv_rate > 3 THEN 15
    WHEN conv_rate > 2 THEN 10
    WHEN conv_rate > 1 THEN 5
    ELSE 0
  END INTO conversion_score
  FROM (
    SELECT COALESCE(
      (COUNT(*) FILTER (WHERE event_name = 'payment_success')::NUMERIC /
       NULLIF(COUNT(*) FILTER (WHERE event_name = 'product_view'), 0)::NUMERIC) * 100,
      0
    ) as conv_rate
    FROM analytics_events WHERE created_at >= NOW() - INTERVAL '30 days'
  ) cr;
  
  -- Customer retention (20 points)
  SELECT CASE 
    WHEN retention_rate > 40 THEN 20
    WHEN retention_rate > 30 THEN 15
    WHEN retention_rate > 20 THEN 10
    WHEN retention_rate > 10 THEN 5
    ELSE 0
  END INTO retention_score
  FROM (
    SELECT COALESCE(
      (COUNT(*) FILTER (WHERE total_orders > 1)::NUMERIC / NULLIF(COUNT(*), 0)::NUMERIC) * 100,
      0
    ) as retention_rate
    FROM customers
  ) rr;
  
  -- Review rating (15 points)
  SELECT CASE 
    WHEN avg_rating >= 4.5 THEN 15
    WHEN avg_rating >= 4.0 THEN 12
    WHEN avg_rating >= 3.5 THEN 8
    WHEN avg_rating >= 3.0 THEN 4
    ELSE 0
  END INTO review_score
  FROM (
    SELECT COALESCE(AVG(rating), 0) as avg_rating
    FROM product_reviews WHERE approved = true
  ) ar;
  
  -- Cart recovery (15 points)
  SELECT CASE 
    WHEN recovery_rate > 20 THEN 15
    WHEN recovery_rate > 15 THEN 12
    WHEN recovery_rate > 10 THEN 8
    WHEN recovery_rate > 5 THEN 4
    ELSE 0
  END INTO recovery_score
  FROM (
    SELECT COALESCE(
      (COUNT(*) FILTER (WHERE recovered = true)::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE abandoned = true), 0)::NUMERIC) * 100,
      0
    ) as recovery_rate
    FROM cart_sessions WHERE created_at >= NOW() - INTERVAL '30 days'
  ) crr;
  
  -- Profit margin (10 points)
  SELECT CASE 
    WHEN avg_margin > 50 THEN 10
    WHEN avg_margin > 40 THEN 8
    WHEN avg_margin > 30 THEN 6
    WHEN avg_margin > 20 THEN 4
    ELSE 0
  END INTO profit_score
  FROM (
    SELECT COALESCE(AVG(profit_margin), 0) as avg_margin
    FROM orders WHERE payment_status = 'paid' AND created_at >= NOW() - INTERVAL '30 days'
  ) pm;
  
  total_score := revenue_score + conversion_score + retention_score + review_score + recovery_score + profit_score;
  
  RETURN LEAST(total_score, 100);
END;
$$;

-- Get profitability stats
CREATE OR REPLACE FUNCTION public.get_profitability_stats(days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_revenue NUMERIC,
  total_cost NUMERIC,
  total_profit NUMERIC,
  avg_profit_margin NUMERIC,
  most_profitable_product_id UUID,
  least_profitable_product_id UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(o.total_amount), 0) as total_revenue,
    COALESCE(SUM(o.total_cost), 0) as total_cost,
    COALESCE(SUM(o.profit_amount), 0) as total_profit,
    COALESCE(AVG(o.profit_margin), 0) as avg_profit_margin,
    (SELECT oi.product_id FROM order_items oi 
     JOIN orders o2 ON o2.id = oi.order_id 
     WHERE o2.payment_status = 'paid' AND o2.created_at >= NOW() - (days || ' days')::INTERVAL
     GROUP BY oi.product_id ORDER BY SUM(o2.profit_amount) DESC LIMIT 1) as most_profitable_product_id,
    (SELECT oi.product_id FROM order_items oi 
     JOIN orders o2 ON o2.id = oi.order_id 
     WHERE o2.payment_status = 'paid' AND o2.created_at >= NOW() - (days || ' days')::INTERVAL
     GROUP BY oi.product_id ORDER BY SUM(o2.profit_amount) ASC LIMIT 1) as least_profitable_product_id
  FROM orders o
  WHERE o.payment_status = 'paid' AND o.created_at >= NOW() - (days || ' days')::INTERVAL;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.calculate_business_health_score TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profitability_stats TO authenticated;
