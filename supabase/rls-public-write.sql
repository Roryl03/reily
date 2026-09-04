-- AskReilly: run this entire script in Supabase → SQL Editor
-- Fixes "new row violates row-level security policy"

-- ── services table ──────────────────────────────────────────
alter table services enable row level security;

drop policy if exists "Public read" on services;
drop policy if exists "Anyone can read services" on services;
drop policy if exists "Admin insert" on services;
drop policy if exists "Admin update" on services;
drop policy if exists "Admin delete" on services;
drop policy if exists "Allow public insert" on services;
drop policy if exists "Allow public update" on services;
drop policy if exists "Allow public delete" on services;

create policy "Public read"
  on services for select
  using (true);

create policy "Allow public insert"
  on services for insert
  with check (true);

create policy "Allow public update"
  on services for update
  using (true);

create policy "Allow public delete"
  on services for delete
  using (true);

-- ── service-images storage bucket ─────────────────────────
-- Create bucket first if missing: Storage → New bucket → "service-images" (public)

drop policy if exists "Public read service images" on storage.objects;
drop policy if exists "Allow uploads to service-images" on storage.objects;
drop policy if exists "Allow update service-images" on storage.objects;
drop policy if exists "Allow delete service-images" on storage.objects;
drop policy if exists "Admin upload" on storage.objects;
drop policy if exists "Public view images" on storage.objects;

create policy "Public read service images"
  on storage.objects for select
  using (bucket_id = 'service-images');

create policy "Allow uploads to service-images"
  on storage.objects for insert
  with check (bucket_id = 'service-images');

create policy "Allow update service-images"
  on storage.objects for update
  using (bucket_id = 'service-images');

create policy "Allow delete service-images"
  on storage.objects for delete
  using (bucket_id = 'service-images');
