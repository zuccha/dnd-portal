alter table "public"."spell_translations" drop constraint "spell_translations_lang_fkey";

alter table "public"."creature_translations" add constraint "creature_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."creature_translations" validate constraint "creature_translations_lang_fkey";

alter table "public"."eldritch_invocation_translations" add constraint "eldritch_invocation_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."eldritch_invocation_translations" validate constraint "eldritch_invocation_translations_lang_fkey";

alter table "public"."weapon_translations" add constraint "weapon_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."weapon_translations" validate constraint "weapon_translations_lang_fkey";

alter table "public"."spell_translations" add constraint "spell_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."spell_translations" validate constraint "spell_translations_lang_fkey";


