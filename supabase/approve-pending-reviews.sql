-- Publish reviews that are still waiting in the moderation queue
-- Run once in Supabase SQL Editor if older reviews were stuck as pending

update service_reviews
set status = 'approved', updated_at = now()
where status = 'pending';
