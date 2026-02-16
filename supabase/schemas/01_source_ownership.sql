CREATE TYPE public.source_ownership AS ENUM (
  'guest',
  'owner'
);

ALTER TYPE public.source_ownership OWNER TO postgres;
