CREATE TYPE public.language_scope AS ENUM (
  'specific',
  'all',
  'none'
);

ALTER TYPE public.language_scope OWNER TO postgres;
