--------------------------------------------------------------------------------
-- SOURCE DEPENDENCY RELATIONSHIP
--------------------------------------------------------------------------------

CREATE TYPE public.source_dependency_relationship AS ENUM (
  'include',
  'require'
);

ALTER TYPE public.source_dependency_relationship OWNER TO postgres;
