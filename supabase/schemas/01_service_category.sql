CREATE TYPE public.service_category AS ENUM (
  'lifestyle',
  'food_drink',
  'lodging',
  'hireling',
  'spellcasting',
  'transport'
);

ALTER TYPE public.service_category OWNER TO postgres;
