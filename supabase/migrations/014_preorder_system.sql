-- Migration 014: Preorder / Prebook System

-- 1. Create preorders table
CREATE TABLE IF NOT EXISTS public.preorders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  discount_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  max_quantity INTEGER DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, ACTIVE, ENDED, SOLD_OUT, CANCELLED
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for quick lookup of active preorders
CREATE INDEX IF NOT EXISTS idx_preorders_status_dates ON public.preorders(status, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_preorders_product_id ON public.preorders(product_id);

-- 2. Create preorder_registrations table
CREATE TABLE IF NOT EXISTS public.preorder_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  preorder_id UUID NOT NULL REFERENCES public.preorders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  discount_percentage NUMERIC(5,2) NOT NULL,
  locked_price NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'REGISTERED', -- REGISTERED, PURCHASED, CANCELLED
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_preorder UNIQUE (user_id, preorder_id)
);

-- Index for quick lookup of user registrations
CREATE INDEX IF NOT EXISTS idx_preorder_regs_user ON public.preorder_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_preorder_regs_preorder ON public.preorder_registrations(preorder_id);

-- Enable RLS
ALTER TABLE public.preorders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preorder_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for preorders
CREATE POLICY "Allow public read access for preorders" ON public.preorders
  FOR SELECT USING (true);

CREATE POLICY "Allow admin all access for preorders" ON public.preorders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- RLS Policies for preorder_registrations
CREATE POLICY "Allow user read own registrations" ON public.preorder_registrations
  FOR SELECT USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Allow authenticated user insert registration" ON public.preorder_registrations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Allow admin all access for registrations" ON public.preorder_registrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
