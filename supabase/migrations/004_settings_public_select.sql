-- 1. Create a brand new, independent database schema
create schema if not exists app_config;

-- 2. Create the settings table inside the new schema
create table if not exists app_config.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

-- 3. Create an independent trigger function for this schema
create or replace function app_config.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Bind the timestamp trigger to the new table
drop trigger if exists set_settings_updated_at on app_config.settings;
create trigger set_settings_updated_at 
  before update on app_config.settings 
  for each row execute function app_config.set_updated_at();

-- 4. Enable Row Level Security (RLS) on the new schema table
alter table app_config.settings enable row level security;

-- Create a helper function to verify admin status safely across schemas
create or replace function app_config.is_admin()
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

-- Define access policies inside the new schema
drop policy if exists "settings public select" on app_config.settings;
create policy "settings public select" on app_config.settings for select using (true);

drop policy if exists "settings admin write" on app_config.settings;
create policy "settings admin write" on app_config.settings for all using (app_config.is_admin()) with check (app_config.is_admin());

-- 5. Clean seed with an explicit conflict resolution rule
insert into app_config.settings (key, value)
values (
  'site_settings',
  '{
    "siteName": "Forest Foundry",
    "logoUrl": "https://api.dicebear.com/7.x/bottts/svg?seed=groot&backgroundColor=2c3e2d",
    "hero": {
      "title": "Ideas",
      "coloredTitle": "Take Shape.",
      "subtitle": "Premium Products",
      "description": "Transform your ideas into stunning physical products with our premium design services and marketplace.",
      "buttonText": "Explore Products",
      "imageUrl": "https://picsum.photos/seed/wooden-guardian-hero/1400/1600",
      "showcaseTitle": "Custom Product",
      "showcaseItalic": "Design Made Easy"
    }
  }'::jsonb
)
on conflict (key) do update set value = excluded.value;