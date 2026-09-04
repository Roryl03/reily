-- Remove demo seed rows from Supabase (run once in SQL Editor if demo listings were inserted)
delete from services where source = 'demo';
