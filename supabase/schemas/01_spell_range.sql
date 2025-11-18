CREATE TYPE public.spell_range AS ENUM (
    'self',
    'sight',
    'special',
    'touch',
    'unlimited',
    'value'
);

ALTER TYPE public.spell_range OWNER TO postgres;
