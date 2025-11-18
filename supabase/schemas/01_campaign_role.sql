CREATE TYPE public.campaign_role AS ENUM (
    'game_master',
    'player'
);

ALTER TYPE public.campaign_role OWNER TO postgres;
