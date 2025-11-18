CREATE TYPE public.weapon_type AS ENUM (
    'simple',
    'martial'
);

ALTER TYPE public.weapon_type OWNER TO postgres;
