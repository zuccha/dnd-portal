CREATE TYPE public.module_role AS ENUM (
  'creator',
  'owner'
);

ALTER TYPE public.module_role OWNER TO postgres;
