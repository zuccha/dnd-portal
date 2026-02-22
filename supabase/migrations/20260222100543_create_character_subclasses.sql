
  create table "public"."character_subclass_translations" (
    "resource_id" uuid not null,
    "lang" text not null
      );


alter table "public"."character_subclass_translations" enable row level security;


  create table "public"."character_subclasses" (
    "resource_id" uuid not null,
    "character_class_id" uuid not null
      );


alter table "public"."character_subclasses" enable row level security;

CREATE UNIQUE INDEX character_subclass_translations_pkey ON public.character_subclass_translations USING btree (resource_id, lang);

CREATE UNIQUE INDEX character_subclasses_pkey ON public.character_subclasses USING btree (resource_id);

alter table "public"."character_subclass_translations" add constraint "character_subclass_translations_pkey" PRIMARY KEY using index "character_subclass_translations_pkey";

alter table "public"."character_subclasses" add constraint "character_subclasses_pkey" PRIMARY KEY using index "character_subclasses_pkey";

alter table "public"."character_subclass_translations" add constraint "character_subclass_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."character_subclass_translations" validate constraint "character_subclass_translations_lang_fkey";

alter table "public"."character_subclass_translations" add constraint "character_subclass_translations_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.character_subclasses(resource_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."character_subclass_translations" validate constraint "character_subclass_translations_resource_id_fkey";

alter table "public"."character_subclasses" add constraint "character_subclasses_character_class_id_fkey" FOREIGN KEY (character_class_id) REFERENCES public.character_classes(resource_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."character_subclasses" validate constraint "character_subclasses_character_class_id_fkey";

alter table "public"."character_subclasses" add constraint "character_subclasses_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."character_subclasses" validate constraint "character_subclasses_resource_id_fkey";

set check_function_bodies = off;

create type "public"."character_subclass_row" as ("source_id" uuid, "source_code" text, "id" uuid, "kind" public.resource_kind, "visibility" public.resource_visibility, "image_url" text, "name" jsonb, "name_short" jsonb, "page" jsonb, "character_class_id" uuid);

CREATE OR REPLACE FUNCTION public.create_character_subclass(p_source_id uuid, p_lang text, p_character_subclass jsonb, p_character_subclass_translation jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id uuid;
  r public.character_subclasses%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.character_subclasses, p_character_subclass);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_character_subclass || jsonb_build_object('kind', 'character_subclass'::public.resource_kind),
    p_character_subclass_translation
  );

  INSERT INTO public.character_subclasses (
    resource_id, character_class_id
  ) VALUES (
    v_id, r.character_class_id
  );

  perform public.upsert_character_subclass_translation(v_id, p_lang, p_character_subclass_translation);

  RETURN v_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_character_subclass(p_id uuid)
 RETURNS public.character_subclass_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT
    r.source_id,
    r.source_code,
    r.id,
    r.kind,
    r.visibility,
    r.image_url,
    r.name,
    r.name_short,
    r.page,
    s.character_class_id
  FROM public.fetch_resource(p_id) AS r
  JOIN public.character_subclasses s ON s.resource_id = r.id
  WHERE r.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_character_subclasses(p_source_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.character_subclass_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'character_subclass'::public.resource_kind
),
src AS (
  SELECT
    b.id,
    b.source_id,
    b.source_code,
    b.kind,
    b.visibility,
    b.image_url,
    b.name,
    b.name_short,
    b.page,
    s.character_class_id
  FROM base b
  JOIN public.character_subclasses s ON s.resource_id = b.id
)
SELECT
  s.source_id,
  s.source_code,
  s.id,
  s.kind,
  s.visibility,
  s.image_url,
  s.name,
  s.name_short,
  s.page,
  s.character_class_id
FROM src s
ORDER BY
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'asc'
      THEN (s.name->>coalesce(p_langs[1],'en'))
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'desc'
      THEN (s.name->>coalesce(p_langs[1],'en'))
  END DESC NULLS LAST;
$function$
;

CREATE OR REPLACE FUNCTION public.update_character_subclass(p_id uuid, p_lang text, p_character_subclass jsonb, p_character_subclass_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_rows int;
BEGIN
  perform public.update_resource(
    p_id,
    p_lang,
    p_character_subclass || jsonb_build_object('kind', 'character_subclass'::public.resource_kind),
    p_character_subclass_translation
  );

  UPDATE public.character_subclasses s
  SET (
    character_class_id
  ) = (
    SELECT r.character_class_id
    FROM jsonb_populate_record(null::public.character_subclasses, to_jsonb(s) || p_character_subclass) AS r
  )
  WHERE s.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_character_subclass_translation(p_id, p_lang, p_character_subclass_translation);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_character_subclass_translation(p_id uuid, p_lang text, p_character_subclass_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  r public.character_subclass_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.character_subclass_translations, p_character_subclass_translation);

  INSERT INTO public.character_subclass_translations AS ct (
    resource_id, lang
  ) VALUES (
    p_id, p_lang
  )
  ON conflict (resource_id, lang) DO NOTHING;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_character_subclass_resource_kind()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'character_subclass'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a character subclass', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."character_subclass_translations" to "anon";

grant insert on table "public"."character_subclass_translations" to "anon";

grant references on table "public"."character_subclass_translations" to "anon";

grant select on table "public"."character_subclass_translations" to "anon";

grant trigger on table "public"."character_subclass_translations" to "anon";

grant truncate on table "public"."character_subclass_translations" to "anon";

grant update on table "public"."character_subclass_translations" to "anon";

grant delete on table "public"."character_subclass_translations" to "authenticated";

grant insert on table "public"."character_subclass_translations" to "authenticated";

grant references on table "public"."character_subclass_translations" to "authenticated";

grant select on table "public"."character_subclass_translations" to "authenticated";

grant trigger on table "public"."character_subclass_translations" to "authenticated";

grant truncate on table "public"."character_subclass_translations" to "authenticated";

grant update on table "public"."character_subclass_translations" to "authenticated";

grant delete on table "public"."character_subclass_translations" to "service_role";

grant insert on table "public"."character_subclass_translations" to "service_role";

grant references on table "public"."character_subclass_translations" to "service_role";

grant select on table "public"."character_subclass_translations" to "service_role";

grant trigger on table "public"."character_subclass_translations" to "service_role";

grant truncate on table "public"."character_subclass_translations" to "service_role";

grant update on table "public"."character_subclass_translations" to "service_role";

grant delete on table "public"."character_subclasses" to "anon";

grant insert on table "public"."character_subclasses" to "anon";

grant references on table "public"."character_subclasses" to "anon";

grant select on table "public"."character_subclasses" to "anon";

grant trigger on table "public"."character_subclasses" to "anon";

grant truncate on table "public"."character_subclasses" to "anon";

grant update on table "public"."character_subclasses" to "anon";

grant delete on table "public"."character_subclasses" to "authenticated";

grant insert on table "public"."character_subclasses" to "authenticated";

grant references on table "public"."character_subclasses" to "authenticated";

grant select on table "public"."character_subclasses" to "authenticated";

grant trigger on table "public"."character_subclasses" to "authenticated";

grant truncate on table "public"."character_subclasses" to "authenticated";

grant update on table "public"."character_subclasses" to "authenticated";

grant delete on table "public"."character_subclasses" to "service_role";

grant insert on table "public"."character_subclasses" to "service_role";

grant references on table "public"."character_subclasses" to "service_role";

grant select on table "public"."character_subclasses" to "service_role";

grant trigger on table "public"."character_subclasses" to "service_role";

grant truncate on table "public"."character_subclasses" to "service_role";

grant update on table "public"."character_subclasses" to "service_role";


  create policy "Creators and GMs can create new character subclass translations"
  on "public"."character_subclass_translations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can delete character subclass translations"
  on "public"."character_subclass_translations"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update character subclass translations"
  on "public"."character_subclass_translations"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check (public.can_edit_resource(resource_id));



  create policy "Users can read character subclass translations"
  on "public"."character_subclass_translations"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Creators and GMs can create new character subclasses"
  on "public"."character_subclasses"
  as permissive
  for insert
  to authenticated
with check ((public.can_edit_resource(resource_id) AND public.can_read_resource(character_class_id)));



  create policy "Creators and GMs can delete character subclasses"
  on "public"."character_subclasses"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update character subclasses"
  on "public"."character_subclasses"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check ((public.can_edit_resource(resource_id) AND public.can_read_resource(character_class_id)));



  create policy "Users can read character subclasses"
  on "public"."character_subclasses"
  as permissive
  for select
  to anon, authenticated
using ((public.can_read_resource(resource_id) AND public.can_read_resource(character_class_id)));


CREATE TRIGGER enforce_character_subclass_resource_kind BEFORE INSERT OR UPDATE ON public.character_subclasses FOR EACH ROW EXECUTE FUNCTION public.validate_character_subclass_resource_kind();


