--------------------------------------------------------------------------------
-- REGISTRY SOURCE ACCESS LEVEL
--------------------------------------------------------------------------------

CREATE TYPE public.registry_source_access_level AS ENUM (
  'read',
  'write'
);

ALTER TYPE public.registry_source_access_level OWNER TO postgres;
