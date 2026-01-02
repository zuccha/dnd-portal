CREATE TYPE public.resource_kind AS ENUM (
  'creature',
  'eldritch_invocation',
  'equipment',
  'spell',
  'character_class'
);

ALTER TYPE public.resource_kind OWNER TO postgres;
