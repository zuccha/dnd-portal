CREATE TYPE public.armor_type AS ENUM (
  'heavy',
  'light',
  'medium',
  'shield'
);

ALTER TYPE public.armor_type OWNER TO postgres;
