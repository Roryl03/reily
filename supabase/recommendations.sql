-- Ask Reilly community recommendations (Phase 1)
-- Run in Supabase SQL Editor after services table exists

create table if not exists service_recommendations (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  visitor_id uuid not null,
  would_recommend boolean not null,
  audience_type text,
  county text,
  town text,
  ranking_eligible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service_id, visitor_id)
);

create index if not exists service_recommendations_service_id_idx
  on service_recommendations (service_id);

create index if not exists service_recommendations_created_at_idx
  on service_recommendations (created_at desc);

create index if not exists service_recommendations_month_idx
  on service_recommendations (service_id, created_at)
  where ranking_eligible = true;

alter table service_recommendations enable row level security;

-- No public direct select — stats via API only (protects visitor_id linkage)

drop policy if exists "Public insert recommendations" on service_recommendations;
create policy "Public insert recommendations"
  on service_recommendations for insert
  with check (visitor_id is not null and service_id is not null);

drop policy if exists "Public update own recommendation" on service_recommendations;
create policy "Public update own recommendation"
  on service_recommendations for update
  using (true)
  with check (visitor_id is not null);

-- Phase 2+: service_reviews, review_helpful_votes, top_pick_results tables
