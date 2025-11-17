CREATE TYPE "public"."spell_casting_time" AS ENUM (
    'action',
    'bonus_action',
    'reaction',
    'value'
);

ALTER TYPE "public"."spell_casting_time" OWNER TO "postgres";
