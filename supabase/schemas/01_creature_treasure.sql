CREATE TYPE public.creature_treasure AS ENUM (
    'any',
    'individual',
    'arcana',
    'armaments',
    'implements',
    'relics',
    'none'
);

ALTER TYPE public.creature_treasure OWNER TO postgres;
