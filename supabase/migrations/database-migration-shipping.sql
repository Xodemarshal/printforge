-- Database Migration for Dual Shipping Management System
-- Add new shipping fields to orders table (Global Mode Design)

-- Note: shipping_mode column is NOT added to orders table
-- Shipping mode is now a global setting configured in Admin Settings

-- Add shipment_status column for manual shipping
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipment_status TEXT CHECK (
  shipment_status IN (
    'order_placed',
    'payment_confirmed',
    'printing',
    'quality_check',
    'packed',
    'ready_for_dispatch',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled'
  )
);

-- Add manual shipping details (used when global shipping mode is MANUAL)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS courier_name TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_url TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS dispatch_date TIMESTAMPTZ;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivered_date TIMESTAMPTZ;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipment_notes TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_shipment_status ON orders(shipment_status);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);

-- Add comment to table
COMMENT ON COLUMN orders.shipment_status IS 'Current shipment status (for manual shipping mode)';
COMMENT ON COLUMN orders.courier_name IS 'Courier name (India Post, DTDC, Delhivery, etc.)';
COMMENT ON COLUMN orders.tracking_number IS 'Tracking/AWB number';
COMMENT ON COLUMN orders.tracking_url IS 'Tracking URL';
COMMENT ON COLUMN orders.dispatch_date IS 'Date when order was dispatched';
COMMENT ON COLUMN orders.delivered_date IS 'Date when order was delivered';
COMMENT ON COLUMN orders.shipment_notes IS 'Internal notes about the shipment';
