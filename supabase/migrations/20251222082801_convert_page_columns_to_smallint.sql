alter table "public"."creature_translations" alter column "page" set data type smallint using "page"::smallint;

alter table "public"."eldritch_invocation_translations" alter column "page" set data type smallint using "page"::smallint;

alter table "public"."spell_translations" alter column "page" set data type smallint using "page"::smallint;

alter table "public"."weapon_translations" alter column "page" set data type smallint using "page"::smallint;


