alter table "public"."eldritch_invocation_translations" drop constraint "eldritch_invocation_translations_r_lang_fkey";
alter table "public"."eldritch_invocation_translations" add constraint "eldritch_invocation_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."eldritch_invocation_translations" validate constraint "eldritch_invocation_translations_lang_fkey";


