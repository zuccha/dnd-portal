CREATE TYPE public.creature_ability AS ENUM (
    'strength',
    'dexterity',
    'constitution',
    'intelligence',
    'wisdom',
    'charisma'
);

ALTER TYPE public.creature_ability OWNER TO postgres;
