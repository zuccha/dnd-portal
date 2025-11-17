CREATE TYPE "public"."creature_size" AS ENUM (
    'tiny',
    'small',
    'medium',
    'large',
    'huge',
    'gargantuan'
);

ALTER TYPE "public"."creature_size" OWNER TO "postgres";
