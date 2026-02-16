CREATE TYPE public.source_role AS ENUM (
  'editor',
  'admin'
);

ALTER TYPE public.source_role OWNER TO postgres;
