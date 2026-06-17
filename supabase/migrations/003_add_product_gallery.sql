-- Add gallery_urls field to products table for multiple images
alter table public.products add column if not exists gallery_urls text[] not null default '{}';

-- Add comment for the new field
comment on column public.products.gallery_urls is 'Array of URLs for the product gallery images';
