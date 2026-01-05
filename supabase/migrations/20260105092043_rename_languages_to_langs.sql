alter table "public"."armor_translations" drop constraint "armor_translations_lang_fkey";
alter table "public"."character_class_translations" drop constraint "character_class_translations_lang_fkey";
alter table "public"."creature_translations" drop constraint "creature_translations_lang_fkey";
alter table "public"."eldritch_invocation_translations" drop constraint "eldritch_invocation_translations_r_lang_fkey";
alter table "public"."equipment_translations" drop constraint "equipment_translations_lang_fkey";
alter table "public"."item_translations" drop constraint "item_translations_lang_fkey";
alter table "public"."resource_translations" drop constraint "resource_translations_lang_fkey";
alter table "public"."spell_translations" drop constraint "spell_translations_lang_fkey";
alter table "public"."tool_translations" drop constraint "tool_translations_lang_fkey";
alter table "public"."weapon_translations" drop constraint "weapon_translations_lang_fkey";
alter table "public"."languages" drop constraint "languages_pkey";
alter table "public"."languages" drop constraint "languages_code_check";

alter table "public"."languages" rename to langs;

CREATE UNIQUE INDEX langs_pkey ON public.langs USING btree (code);
alter table "public"."langs" add constraint "langs_pkey" PRIMARY KEY using index "langs_pkey";

alter table "public"."langs" add constraint "langs_code_check" CHECK ((code ~ '^[a-z]{2}(-[A-Z]{2})?$'::text)) not valid;
alter table "public"."langs" validate constraint "langs_code_check";

alter table "public"."armor_translations" add constraint "armor_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."armor_translations" validate constraint "armor_translations_lang_fkey";

alter table "public"."character_class_translations" add constraint "character_class_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."character_class_translations" validate constraint "character_class_translations_lang_fkey";

alter table "public"."creature_translations" add constraint "creature_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."creature_translations" validate constraint "creature_translations_lang_fkey";

alter table "public"."eldritch_invocation_translations" add constraint "eldritch_invocation_translations_r_lang_fkey" FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."eldritch_invocation_translations" validate constraint "eldritch_invocation_translations_r_lang_fkey";

alter table "public"."equipment_translations" add constraint "equipment_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."equipment_translations" validate constraint "equipment_translations_lang_fkey";

alter table "public"."item_translations" add constraint "item_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."item_translations" validate constraint "item_translations_lang_fkey";

alter table "public"."resource_translations" add constraint "resource_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."resource_translations" validate constraint "resource_translations_lang_fkey";

alter table "public"."spell_translations" add constraint "spell_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."spell_translations" validate constraint "spell_translations_lang_fkey";

alter table "public"."tool_translations" add constraint "tool_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."tool_translations" validate constraint "tool_translations_lang_fkey";

alter table "public"."weapon_translations" add constraint "weapon_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."weapon_translations" validate constraint "weapon_translations_lang_fkey";

alter table "public"."eldritch_invocation_translations" rename constraint "eldritch_invocation_translations_r_pkey" to "eldritch_invocation_translations_pkey";

