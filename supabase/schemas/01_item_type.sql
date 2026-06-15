CREATE TYPE public.item_type AS ENUM (
  'potion',
  'ring',
  'rod',
  'scroll',
  'staff',
  'wand',
  'drawn_vehicle',
  'other'
);

ALTER TYPE public.item_type OWNER TO postgres;
