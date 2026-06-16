-- Add image_url field to categories table
alter table public.categories add column if not exists image_url text;

-- Add comment for the new field
comment on column public.categories.image_url is 'URL to the category image uploaded by admin';