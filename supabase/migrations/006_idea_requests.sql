alter table public.stl_uploads
  add column if not exists instagram_handle text not null default '',
  add column if not exists idea text not null default '',
  add column if not exists reference_images jsonb not null default '[]'::jsonb;

alter table public.stl_uploads
  alter column status set default 'pending_review';

comment on column public.stl_uploads.instagram_handle is 'Instagram handle supplied with the custom idea request';
comment on column public.stl_uploads.idea is 'Customer idea brief for the custom item request';
comment on column public.stl_uploads.reference_images is 'Array of public image URLs used as visual references for the request';
