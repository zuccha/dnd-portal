CREATE TYPE "public"."damage_type" AS ENUM (
    'acid',
    'bludgeoning',
    'cold',
    'fire',
    'force',
    'lightning',
    'necrotic',
    'piercing',
    'poison',
    'psychic',
    'radiant',
    'slashing',
    'thunder'
);

ALTER TYPE "public"."damage_type" OWNER TO "postgres";
