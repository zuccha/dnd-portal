--------------------------------------------------------------------------------
-- EQUIPMENT RARITY
--------------------------------------------------------------------------------

CREATE TYPE public.equipment_rarity AS ENUM (
  'common',
  'uncommon',
  'rare',
  'very_rare',
  'legendary',
  'artifact',
  'various'
);

ALTER TYPE public.equipment_rarity OWNER TO postgres;
