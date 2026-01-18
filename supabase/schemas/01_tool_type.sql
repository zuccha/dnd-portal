CREATE TYPE public.tool_type AS ENUM (
  'artisan',
  'other',
  'gaming_set',
  'musical_instrument'
);

ALTER TYPE public.tool_type OWNER TO postgres;
