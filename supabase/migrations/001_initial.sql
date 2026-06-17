create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'customer',
  avatar_url text,
  phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
  );
$$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null default 0,
  category_id uuid references public.categories(id) on delete set null,
  image_url text,
  video_url text,
  model_url text,
  material_info text,
  color_options text[] not null default '{}',
  specifications jsonb not null default '{}'::jsonb,
  rating numeric(3,2) not null default 0,
  review_count integer not null default 0,
  featured boolean not null default false,
  best_seller boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null default 'percentage',
  discount_value numeric(10,2) not null default 0,
  expires_at timestamptz,
  usage_limit integer not null default 0,
  times_used integer not null default 0,
  min_order_total numeric(10,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending',
  total_amount numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  shipping_address_id uuid references public.addresses(id) on delete set null,
  payment_status text not null default 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null default '',
  quantity integer not null default 1,
  unit_price numeric(10,2) not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete set null,
  product_id uuid not null references public.products(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  approved boolean not null default true,
  hidden boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, product_id)
);

create table if not exists public.stl_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text not null,
  file_size bigint not null default 0,
  status text not null default 'uploaded',
  estimated_price numeric(10,2),
  print_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.print_jobs (
  id uuid primary key default gen_random_uuid(),
  stl_upload_id uuid not null references public.stl_uploads(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  material text not null,
  color text not null,
  layer_height numeric(4,2) not null default 0.2,
  infill integer not null default 20,
  quantity integer not null default 1,
  notes text,
  estimated_hours numeric(10,2),
  assigned_printer text,
  status text not null default 'queued',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  material text not null unique,
  quantity integer not null default 0,
  threshold integer not null default 10,
  unit text not null default 'kg',
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid not null references public.inventory(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  quantity_change integer not null default 0,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  user_id uuid references public.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  subject text not null,
  message text not null,
  status text not null default 'open',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_users_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger set_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger set_products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger set_addresses_updated_at before update on public.addresses for each row execute function public.set_updated_at();
create trigger set_coupons_updated_at before update on public.coupons for each row execute function public.set_updated_at();
create trigger set_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger set_reviews_updated_at before update on public.reviews for each row execute function public.set_updated_at();
create trigger set_stl_uploads_updated_at before update on public.stl_uploads for each row execute function public.set_updated_at();
create trigger set_print_jobs_updated_at before update on public.print_jobs for each row execute function public.set_updated_at();
create trigger set_inventory_updated_at before update on public.inventory for each row execute function public.set_updated_at();
create trigger set_support_tickets_updated_at before update on public.support_tickets for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.addresses enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlists enable row level security;
alter table public.stl_uploads enable row level security;
alter table public.print_jobs enable row level security;
alter table public.inventory enable row level security;
alter table public.inventory_logs enable row level security;
alter table public.analytics_events enable row level security;
alter table public.notifications enable row level security;
alter table public.support_tickets enable row level security;
alter table public.settings enable row level security;

create policy "users own row" on public.users for select using (auth.uid() = id or public.is_admin());
create policy "users update own row" on public.users for update using (auth.uid() = id or public.is_admin());
create policy "users insert own row" on public.users for insert with check (auth.uid() = id or public.is_admin());

create policy "categories public select" on public.categories for select using (true);
create policy "categories admin write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "products public active" on public.products for select using (active = true or public.is_admin());
create policy "products admin write" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "addresses owner" on public.addresses for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());

create policy "coupons admin" on public.coupons for all using (public.is_admin()) with check (public.is_admin());

create policy "orders owner" on public.orders for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());
create policy "order_items owner" on public.order_items for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
  )
);
create policy "order_items admin write" on public.order_items for insert with check (public.is_admin() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

create policy "reviews public approved" on public.reviews for select using (approved = true and hidden = false or public.is_admin());
create policy "reviews owner insert" on public.reviews for insert with check (auth.uid() = user_id or public.is_admin());
create policy "reviews admin write" on public.reviews for update using (public.is_admin()) with check (public.is_admin());
create policy "reviews admin delete" on public.reviews for delete using (public.is_admin());

create policy "wishlists owner" on public.wishlists for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());

create policy "stl owner" on public.stl_uploads for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());

create policy "print jobs admin" on public.print_jobs for all using (public.is_admin()) with check (public.is_admin());

create policy "inventory admin" on public.inventory for all using (public.is_admin()) with check (public.is_admin());
create policy "inventory logs admin" on public.inventory_logs for select using (public.is_admin());
create policy "inventory logs insert admin" on public.inventory_logs for insert with check (public.is_admin());

create policy "analytics insert authenticated" on public.analytics_events for insert with check (auth.uid() is not null or public.is_admin());
create policy "analytics admin select" on public.analytics_events for select using (public.is_admin());

create policy "notifications owner" on public.notifications for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());

create policy "support owner" on public.support_tickets for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());

create policy "settings admin" on public.settings for all using (public.is_admin()) with check (public.is_admin());

insert into public.inventory (material, quantity, threshold, unit) values
  ('PLA', 50, 10, 'kg'),
  ('PETG', 40, 10, 'kg'),
  ('Resin', 25, 5, 'kg'),
  ('Packaging', 100, 20, 'units'),
  ('LEDs', 200, 50, 'pcs'),
  ('Electronics', 75, 15, 'pcs')
on conflict (material) do nothing;
