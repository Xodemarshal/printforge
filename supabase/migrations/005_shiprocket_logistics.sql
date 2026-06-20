alter table public.products
  add column if not exists shipping_weight_grams numeric(10,2) not null default 250,
  add column if not exists shipping_length_cm numeric(10,2) not null default 20,
  add column if not exists shipping_width_cm numeric(10,2) not null default 15,
  add column if not exists shipping_height_cm numeric(10,2) not null default 10;

alter table public.orders
  add column if not exists idempotency_key text unique,
  add column if not exists payment_method text not null default 'cod',
  add column if not exists customer_name text,
  add column if not exists customer_email text,
  add column if not exists shipping_phone text,
  add column if not exists shipping_line1 text,
  add column if not exists shipping_line2 text,
  add column if not exists shipping_city text,
  add column if not exists shipping_state text,
  add column if not exists shipping_postal_code text,
  add column if not exists shipping_country text default 'IN',
  add column if not exists parcel_weight_grams numeric(10,2) not null default 250,
  add column if not exists parcel_length_cm numeric(10,2) not null default 20,
  add column if not exists parcel_width_cm numeric(10,2) not null default 15,
  add column if not exists parcel_height_cm numeric(10,2) not null default 10,
  add column if not exists shipping_provider text not null default 'shiprocket',
  add column if not exists shiprocket_order_id text,
  add column if not exists shiprocket_shipment_id text,
  add column if not exists shiprocket_awb_number text,
  add column if not exists shiprocket_tracking_id text,
  add column if not exists shiprocket_courier_name text,
  add column if not exists shiprocket_label_pdf_url text,
  add column if not exists shiprocket_tracking_url text,
  add column if not exists shiprocket_status text not null default 'not_generated',
  add column if not exists shiprocket_pickup_status text not null default 'not_picked_up',
  add column if not exists shiprocket_tracking_events jsonb not null default '[]'::jsonb,
  add column if not exists shiprocket_payload jsonb not null default '{}'::jsonb,
  add column if not exists shiprocket_last_event text,
  add column if not exists shiprocket_last_synced_at timestamptz,
  add column if not exists shiprocket_error text;

create index if not exists orders_shiprocket_awb_number_idx on public.orders (shiprocket_awb_number);
create index if not exists orders_shiprocket_tracking_id_idx on public.orders (shiprocket_tracking_id);
create index if not exists orders_shiprocket_pickup_status_idx on public.orders (shiprocket_pickup_status);
create index if not exists orders_shiprocket_status_idx on public.orders (shiprocket_status);
