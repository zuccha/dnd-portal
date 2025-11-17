CREATE TYPE "public"."spell_school" AS ENUM (
    'abjuration',
    'conjuration',
    'divination',
    'enchantment',
    'evocation',
    'illusion',
    'necromancy',
    'transmutation'
);

ALTER TYPE "public"."spell_school" OWNER TO "postgres";
