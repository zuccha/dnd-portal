CREATE TYPE public.weapon_mastery AS ENUM (
    'cleave',
    'graze',
    'nick',
    'push',
    'sap',
    'slow',
    'topple',
    'vex'
);

ALTER TYPE public.weapon_mastery OWNER TO postgres;
