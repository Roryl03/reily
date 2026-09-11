-- Fix postcodes already in the database: uppercase letters + standard spacing.
-- Run in Supabase → SQL Editor.
--
-- Example: bt414da  →  BT41 4DA
--          BT414DA  →  BT41 4DA
--
-- Step 1: Preview what will change (optional)
-- select id, name, postcode as before, upper(
--   case
--     when trim(postcode) = 'N/A' then 'N/A'
--     when length(regexp_replace(upper(trim(postcode)), '[^A-Z0-9]', '', 'g')) >= 5 then
--       left(regexp_replace(upper(trim(postcode)), '[^A-Z0-9]', '', 'g'), -3)
--       || ' '
--       || right(regexp_replace(upper(trim(postcode)), '[^A-Z0-9]', '', 'g'), 3)
--     else regexp_replace(upper(trim(postcode)), '[^A-Z0-9]', '', 'g')
--   end
-- ) as after
-- from services
-- where postcode is not null and trim(postcode) <> '';

-- Step 2: Apply the update
update services
set postcode = upper(
  case
    when trim(postcode) = 'N/A' then 'N/A'
    when length(regexp_replace(upper(trim(postcode)), '[^A-Z0-9]', '', 'g')) >= 5 then
      left(regexp_replace(upper(trim(postcode)), '[^A-Z0-9]', '', 'g'), -3)
      || ' '
      || right(regexp_replace(upper(trim(postcode)), '[^A-Z0-9]', '', 'g'), 3)
    else regexp_replace(upper(trim(postcode)), '[^A-Z0-9]', '', 'g')
  end
)
where postcode is not null
  and trim(postcode) <> ''
  and trim(postcode) <> 'N/A';

-- Step 3: After running this, open Admin → Dashboard → "Refresh all map locations"
-- to re-place pins accurately from each address + postcode.
