-- Ask Reilly Top Picks & community analytics (Phases 4+)
-- Run after supabase/recommendations.sql and community-reviews.sql

create table if not exists top_pick_results (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  period_year int not null,
  period_month int not null check (period_month >= 1 and period_month <= 12),
  scope text not null check (scope in ('near', 'across')),
  scope_key text not null default 'ni',
  rank int not null check (rank >= 1 and rank <= 10),
  top_picks_score numeric not null,
  positive_recommendations int not null default 0,
  negative_recommendations int not null default 0,
  total_recommendations int not null default 0,
  recommend_percent numeric,
  average_rating numeric,
  review_count int not null default 0,
  previous_rank int,
  finalized_at timestamptz,
  created_at timestamptz not null default now(),
  unique (service_id, period_year, period_month, scope, scope_key)
);

create index if not exists top_pick_results_period_idx
  on top_pick_results (period_year desc, period_month desc, scope, scope_key, rank);

create table if not exists top_pick_badges (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  period_year int not null,
  period_month int not null check (period_month >= 1 and period_month <= 12),
  scope text not null check (scope in ('near', 'across')),
  rank int not null,
  label text not null,
  created_at timestamptz not null default now(),
  unique (service_id, period_year, period_month, scope)
);

create index if not exists top_pick_badges_service_idx
  on top_pick_badges (service_id, period_year desc, period_month desc);

create table if not exists recommendation_risk_flags (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  flag_type text not null,
  details jsonb not null default '{}'::jsonb,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists recommendation_risk_flags_service_idx
  on recommendation_risk_flags (service_id, created_at desc)
  where resolved = false;
