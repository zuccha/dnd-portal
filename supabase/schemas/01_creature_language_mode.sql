CREATE TYPE public.creature_language_mode AS ENUM (
  'speaks',
  'understands'
);

ALTER TYPE public.creature_language_mode OWNER TO postgres;
