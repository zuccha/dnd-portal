ALTER TYPE public.resource_kind ADD VALUE IF NOT EXISTS 'feat';

CREATE TYPE public.feat_category AS ENUM (
  'origin',
  'general',
  'fighting_style',
  'epic_boon'
);
