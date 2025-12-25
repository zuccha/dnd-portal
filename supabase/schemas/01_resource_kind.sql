CREATE TYPE public.resource_kind AS ENUM (
  'creature',
  'eldritch_invocation',
  'equipment',
  'spell'
);

ALTER TYPE public.resource_kind OWNER TO postgres;
