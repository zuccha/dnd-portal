CREATE TYPE public.plane_category AS ENUM (
  'material',
  'transitive',
  'inner',
  'outer',
  'other',
  'negative',
  'positive'
);

ALTER TYPE public.plane_category OWNER TO postgres;
