CREATE TYPE public.spell_duration AS ENUM (
    'instantaneous',
    'special',
    'until_dispelled',
    'until_dispelled_or_triggered',
    'value'
);

ALTER TYPE public.spell_duration OWNER TO postgres;
