-- 008_complete_growth_platform.sql
-- Complete growth platform implementation

-- EMAIL LOGS (prevent duplicates, track delivery)
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  template_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_email_logs_order_id ON public.email_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email ON public.email_logs(email);
CREATE INDEX IF NOT EXISTS idx_email_logs_template_status ON public.email_logs(template_name, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_logs_dedup ON public.email_logs(order_id, email, template_name) WHERE status = 'sent';

-- CUSTOMERS (GDPR-compliant collection)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  email TEXT UNIQUE,
  phone TEXT,
  name TEXT,
  first_order_date TIMESTAMPTZ,
  last_order_date TIMESTAMPTZ,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_total_spent ON public.customers(total_spent DESC);
CREATE INDEX IF NOT EXISTS idx_customers_last_order ON public.customers(last_order_date DESC);

-- CART SESSIONS (abandoned cart tracking)
CREATE TABLE IF NOT EXISTS public.cart_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  cart_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  cart_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_activity TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  abandoned BOOLEAN NOT NULL DEFAULT false,
  recovered BOOLEAN NOT NULL DEFAULT false,
  recovery_email_sent BOOLEAN NOT NULL DEFAULT false,
  recovered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_cart_sessions_session_id ON public.cart_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_sessions_customer_id ON public.cart_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_cart_sessions_abandoned ON public.cart_sessions(abandoned) WHERE abandoned = true;
CREATE INDEX IF NOT EXISTS idx_cart_sessions_last_activity ON public.cart_sessions(last_activity DESC);

-- ENHANCE ANALYTICS EVENTS
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS event_name TEXT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS page_url TEXT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS referrer TEXT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS device_type TEXT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS browser TEXT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS revenue NUMERIC(12,2);
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS cart_value NUMERIC(12,2);

CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_product_id ON public.analytics_events(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user_created ON public.analytics_events(user_id, created_at DESC);

-- LEADS (contact form, WhatsApp, etc.)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  phone TEXT,
  source TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  message TEXT,
  metadata JSONB,
  converted BOOLEAN NOT NULL DEFAULT false,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_converted ON public.leads(converted);

-- Update existing analytics_events event_type to event_name
UPDATE public.analytics_events SET event_name = event_type WHERE event_name IS NULL;

-- RLS POLICIES

-- Email logs (admin only)
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view email logs" ON public.email_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Customers (admin only)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage customers" ON public.customers FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Cart sessions (users can see their own)
ALTER TABLE public.cart_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their cart sessions" ON public.cart_sessions FOR SELECT TO authenticated USING (
  user_id = auth.uid()
);
CREATE POLICY "Admin can view all cart sessions" ON public.cart_sessions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Leads (admin only)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage leads" ON public.leads FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Analytics events (anyone can insert, admin can view)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can track events" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can view their events" ON public.analytics_events FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can view all events" ON public.analytics_events FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- FUNCTIONS FOR ANALYTICS

-- Get product performance
CREATE OR REPLACE FUNCTION public.get_product_performance(days INTEGER DEFAULT 30)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  views BIGINT,
  unique_visitors BIGINT,
  adds_to_cart BIGINT,
  purchases BIGINT,
  revenue NUMERIC,
  conversion_rate NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.name as product_name,
    COUNT(*) FILTER (WHERE ae.event_name = 'product_view') as views,
    COUNT(DISTINCT ae.session_id) FILTER (WHERE ae.event_name = 'product_view') as unique_visitors,
    COUNT(*) FILTER (WHERE ae.event_name = 'add_to_cart') as adds_to_cart,
    COUNT(*) FILTER (WHERE ae.event_name = 'payment_success') as purchases,
    COALESCE(SUM(ae.revenue) FILTER (WHERE ae.event_name = 'payment_success'), 0) as revenue,
    CASE 
      WHEN COUNT(*) FILTER (WHERE ae.event_name = 'product_view') > 0 
      THEN ROUND((COUNT(*) FILTER (WHERE ae.event_name = 'payment_success')::NUMERIC / 
                  COUNT(*) FILTER (WHERE ae.event_name = 'product_view')::NUMERIC) * 100, 2)
      ELSE 0
    END as conversion_rate
  FROM public.products p
  LEFT JOIN public.analytics_events ae ON ae.product_id = p.id 
    AND ae.created_at >= NOW() - (days || ' days')::INTERVAL
  WHERE p.active = true
  GROUP BY p.id, p.name
  ORDER BY views DESC;
END;
$$;

-- Get conversion funnel
CREATE OR REPLACE FUNCTION public.get_conversion_funnel(days INTEGER DEFAULT 30)
RETURNS TABLE (
  step TEXT,
  count BIGINT,
  conversion_rate NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  total_views BIGINT;
BEGIN
  SELECT COUNT(*) INTO total_views 
  FROM public.analytics_events 
  WHERE event_name = 'product_view' 
    AND created_at >= NOW() - (days || ' days')::INTERVAL;
    
  IF total_views = 0 THEN
    total_views := 1;
  END IF;
  
  RETURN QUERY
  SELECT 
    ae.event_name as step,
    COUNT(*) as count,
    ROUND((COUNT(*)::NUMERIC / total_views::NUMERIC) * 100, 2) as conversion_rate
  FROM public.analytics_events ae
  WHERE ae.event_name IN ('product_view', 'add_to_cart', 'checkout_started', 'payment_attempted', 'payment_success')
    AND ae.created_at >= NOW() - (days || ' days')::INTERVAL
  GROUP BY ae.event_name
  ORDER BY 
    CASE ae.event_name
      WHEN 'product_view' THEN 1
      WHEN 'add_to_cart' THEN 2
      WHEN 'checkout_started' THEN 3
      WHEN 'payment_attempted' THEN 4
      WHEN 'payment_success' THEN 5
    END;
END;
$$;

-- Get revenue stats
CREATE OR REPLACE FUNCTION public.get_revenue_stats(days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_revenue NUMERIC,
  total_orders BIGINT,
  avg_order_value NUMERIC,
  returning_customers BIGINT,
  new_customers BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(o.total_amount), 0) as total_revenue,
    COUNT(o.id) as total_orders,
    COALESCE(AVG(o.total_amount), 0) as avg_order_value,
    COUNT(DISTINCT o.user_id) FILTER (
      WHERE EXISTS (
        SELECT 1 FROM public.orders o2 
        WHERE o2.user_id = o.user_id 
          AND o2.created_at < o.created_at
      )
    ) as returning_customers,
    COUNT(DISTINCT o.user_id) FILTER (
      WHERE NOT EXISTS (
        SELECT 1 FROM public.orders o2 
        WHERE o2.user_id = o.user_id 
          AND o2.created_at < o.created_at
      )
    ) as new_customers
  FROM public.orders o
  WHERE o.payment_status = 'paid'
    AND o.created_at >= NOW() - (days || ' days')::INTERVAL;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_product_performance TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_conversion_funnel TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_revenue_stats TO authenticated;
