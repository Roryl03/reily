-- Ask Reilly privacy-conscious analytics
-- Run in Supabase SQL Editor

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null,
  session_id uuid not null,
  event_type text not null,
  audience_type text,
  county text,
  town text,
  properties jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_at_idx
  on analytics_events (created_at desc);

create index if not exists analytics_events_event_type_idx
  on analytics_events (event_type);

create index if not exists analytics_events_visitor_id_idx
  on analytics_events (visitor_id);

create index if not exists analytics_events_audience_type_idx
  on analytics_events (audience_type);

alter table analytics_events enable row level security;

drop policy if exists "Allow public insert analytics" on analytics_events;
create policy "Allow public insert analytics"
  on analytics_events for insert
  with check (true);

-- Reads via service role / admin API only — no public select policy
