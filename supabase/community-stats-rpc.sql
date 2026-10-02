-- Public aggregate reads for recommendation stats (no visitor_id exposed)
-- Run in Supabase SQL Editor

create or replace function public.get_service_recommendation_stats(p_service_id uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'positive', count(*) filter (where would_recommend),
    'negative', count(*) filter (where not would_recommend),
    'total', count(*)
  )
  from service_recommendations
  where service_id = p_service_id
    and ranking_eligible = true;
$$;

grant execute on function public.get_service_recommendation_stats(uuid) to anon, authenticated, service_role;
