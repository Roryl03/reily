-- Run in Supabase SQL editor for pop-up / mobile listings
alter table services
  add column if not exists no_fixed_location boolean default false,
  add column if not exists location_instructions text;
