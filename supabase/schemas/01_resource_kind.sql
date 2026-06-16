CREATE TYPE public.resource_kind AS ENUM (
  'creature',
  'eldritch_invocation',
  'equipment',
  'spell',
  'character_class',
  'armor',
  'item',
  'tool',
  'weapon',
  'language',
  'plane',
  'creature_tag',
  'character_subclass',
  'species',
  'feat',
  'feature',
  'metamagic',
  'maneuver',
  'background',
  'vehicle',
  'service'
);

ALTER TYPE public.resource_kind OWNER TO postgres;
