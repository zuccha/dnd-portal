CREATE TYPE "public"."weapon_property" AS ENUM (
    'ammunition',
    'finesse',
    'heavy',
    'light',
    'loading',
    'range',
    'reach',
    'throw',
    'two-handed',
    'versatile'
);

ALTER TYPE "public"."weapon_property" OWNER TO "postgres";
