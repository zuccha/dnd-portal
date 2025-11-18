CREATE TYPE public.creature_condition AS ENUM (
    'blinded',
    'charmed',
    'deafened',
    'frightened',
    'grappled',
    'incapacitaded',
    'invisible',
    'paralyzed',
    'petrified',
    'poisoned',
    'prone',
    'restrained',
    'stunned',
    'unconcious',
    'exhaustion'
);

ALTER TYPE public.creature_condition OWNER TO postgres;
