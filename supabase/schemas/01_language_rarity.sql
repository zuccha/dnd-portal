CREATE TYPE public.language_rarity AS ENUM (
  'standard',
  'rare',
  'special'
);

ALTER TYPE public.language_rarity OWNER TO postgres;
