-- Migration 016: Preorder Reservation Fee & Access Grant System
-- Reworks preorder_registrations to support actual payment of a small reservation fee
-- and admin-controlled access granting with fee deduction at final checkout.

-- 1. Add reservation_fee to preorders table (the small amount user must pay to register interest)
ALTER TABLE public.preorders
  ADD COLUMN IF NOT EXISTS reservation_fee NUMERIC(10,2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.preorders.reservation_fee IS
  'Small reservation deposit fee the customer must pay to prove interest (e.g. ₹1–₹100). '
  'This amount is deducted from the final product price when admin grants access.';

-- 2. Enhance preorder_registrations with payment tracking and admin access grant
ALTER TABLE public.preorder_registrations
  ADD COLUMN IF NOT EXISTS reservation_fee_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending',
  -- payment_status: pending | paid | failed | refunded
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS granted_access BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS granted_at TIMESTAMPTZ;

COMMENT ON COLUMN public.preorder_registrations.reservation_fee_paid IS
  'The actual amount paid by the user as a reservation deposit.';
COMMENT ON COLUMN public.preorder_registrations.granted_access IS
  'Admin manually grants this user early access to purchase the product. '
  'When true, the user gets to pay (product_price - reservation_fee_paid) at checkout.';
COMMENT ON COLUMN public.preorder_registrations.granted_at IS
  'Timestamp when admin granted access to this user.';

-- 3. Index for quick lookup of granted users by product
CREATE INDEX IF NOT EXISTS idx_preorder_regs_granted ON public.preorder_registrations(product_id, granted_access)
  WHERE granted_access = TRUE;

CREATE INDEX IF NOT EXISTS idx_preorder_regs_payment ON public.preorder_registrations(razorpay_order_id);
