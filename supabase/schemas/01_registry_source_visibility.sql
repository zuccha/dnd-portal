--------------------------------------------------------------------------------
-- REGISTRY SOURCE VISIBILITY
--------------------------------------------------------------------------------

CREATE TYPE public.registry_source_visibility AS ENUM (
  'public',
  'private'
);

ALTER TYPE public.registry_source_visibility OWNER TO postgres;
