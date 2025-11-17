CREATE TYPE "public"."creature_alignment" AS ENUM (
    'lawful_good',
    'lawful_neutral',
    'lawful_evil',
    'neutral_good',
    'true_neutral',
    'neutral_evil',
    'chaotic_good',
    'chaotic_neutral',
    'chaotic_evil',
    'unaligned'
);

ALTER TYPE "public"."creature_alignment" OWNER TO "postgres";
