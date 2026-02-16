CREATE TYPE public.source_visibility AS ENUM (
  'private',
  'public',
  'purchasable'
);

ALTER TYPE public.source_visibility OWNER TO postgres;
