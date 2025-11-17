CREATE TYPE "public"."creature_habitat" AS ENUM (
    'any',
    'arctic',
    'coastal',
    'desert',
    'forest',
    'grassland',
    'hill',
    'mountain',
    'planar',
    'swamp',
    'underdark',
    'underwater',
    'urban'
);

ALTER TYPE "public"."creature_habitat" OWNER TO "postgres";
