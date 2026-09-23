-- Ask Reilly community reviews (Phase 2+)
-- Run after supabase/recommendations.sql

create table if not exists service_reviews (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  visitor_id uuid not null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  would_recommend boolean not null,
  visit_month smallint check (visit_month >= 1 and visit_month <= 12),
  visit_year smallint check (visit_year >= 2000 and visit_year <= 2100),
  review_text text not null check (char_length(trim(review_text)) >= 10),
  display_name text,
  is_anonymous boolean not null default true,
  extra_answers jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'hidden', 'removed')),
  helpful_count int not null default 0,
  audience_type text,
  county text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_reviews_service_status_idx
  on service_reviews (service_id, status, created_at desc);

create index if not exists service_reviews_status_idx
  on service_reviews (status, created_at desc);

create table if not exists review_helpful_votes (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references service_reviews(id) on delete cascade,
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  unique (review_id, visitor_id)
);

create index if not exists review_helpful_votes_review_idx
  on review_helpful_votes (review_id);

create table if not exists review_reports (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references service_reviews(id) on delete cascade,
  visitor_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now(),
  unique (review_id, visitor_id)
);

create index if not exists review_reports_status_idx
  on review_reports (status, created_at desc);

create table if not exists review_moderation_log (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references service_reviews(id) on delete cascade,
  action text not null,
  previous_status text,
  new_status text,
  admin_note text,
  created_at timestamptz not null default now()
);

create index if not exists review_moderation_log_review_idx
  on review_moderation_log (review_id, created_at desc);

-- Future: verified service owner responses (not exposed to reviewers)
create table if not exists service_review_responses (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references service_reviews(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  response_text text not null,
  status text not null default 'approved',
  created_at timestamptz not null default now()
);

alter table service_reviews enable row level security;
alter table review_helpful_votes enable row level security;
alter table review_reports enable row level security;

-- No public direct select on reviews — served via API (hides visitor_id)

drop policy if exists "Public insert reviews" on service_reviews;
create policy "Public insert reviews"
  on service_reviews for insert
  with check (visitor_id is not null and service_id is not null);

drop policy if exists "Public insert helpful votes" on review_helpful_votes;
create policy "Public insert helpful votes"
  on review_helpful_votes for insert
  with check (visitor_id is not null and review_id is not null);

drop policy if exists "Public insert review reports" on review_reports;
create policy "Public insert review reports"
  on review_reports for insert
  with check (visitor_id is not null and review_id is not null);
