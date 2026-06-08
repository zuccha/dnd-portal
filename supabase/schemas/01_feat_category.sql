CREATE TYPE public.feat_category AS ENUM (
  'origin',
  'general',
  'fighting_style',
  'epic_boon'
);

ALTER TYPE public.feat_category OWNER TO postgres;
