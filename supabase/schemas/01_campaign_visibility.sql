CREATE TYPE public.campaign_visibility AS ENUM (
    'public',
    'private',
    'purchasable'
);

ALTER TYPE public.campaign_visibility OWNER TO postgres;
