CREATE TYPE public.item_type AS ENUM (
  'potion',
  'ring',
  'rod',
  'scroll',
  'staff',
  'wand',
  'other'
);

ALTER TYPE public.item_type OWNER TO postgres;
