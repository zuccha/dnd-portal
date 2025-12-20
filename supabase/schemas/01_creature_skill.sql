CREATE TYPE public.creature_skill AS ENUM (
  'athletics',
  'acrobatics',
  'sleight_of_hand',
  'stealth',
  'arcana',
  'history',
  'nature',
  'religion',
  'animal_handling',
  'insight',
  'medicine',
  'perception',
  'survival',
  'deception',
  'intimidation',
  'performance',
  'persuasion',
  'investigation'
);

ALTER TYPE public.creature_skill OWNER TO postgres;
