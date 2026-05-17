CREATE TYPE public.weapon_mastery AS ENUM (
  'cleave',
  'graze',
  'nick',
  'push',
  'sap',
  'slow',
  'topple',
  'vex',
  'none'
);

ALTER TYPE public.weapon_mastery OWNER TO postgres;
