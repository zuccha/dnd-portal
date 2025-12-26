CREATE TYPE public.tool_type AS ENUM (
  'artisan',
  'other'
);

ALTER TYPE public.tool_type OWNER TO postgres;
