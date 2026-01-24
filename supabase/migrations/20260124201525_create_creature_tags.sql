
  create table "public"."creature_tag_translations" (
    "resource_id" uuid not null,
    "lang" text not null
      );


alter table "public"."creature_tag_translations" enable row level security;


  create table "public"."creature_tags" (
    "resource_id" uuid not null
      );


alter table "public"."creature_tags" enable row level security;

CREATE UNIQUE INDEX creature_tag_translations_pkey ON public.creature_tag_translations USING btree (resource_id, lang);

CREATE UNIQUE INDEX creature_tags_pkey ON public.creature_tags USING btree (resource_id);

alter table "public"."creature_tag_translations" add constraint "creature_tag_translations_pkey" PRIMARY KEY using index "creature_tag_translations_pkey";

alter table "public"."creature_tags" add constraint "creature_tags_pkey" PRIMARY KEY using index "creature_tags_pkey";

alter table "public"."creature_tag_translations" add constraint "creature_tag_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."creature_tag_translations" validate constraint "creature_tag_translations_lang_fkey";

alter table "public"."creature_tag_translations" add constraint "creature_tag_translations_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.creature_tags(resource_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."creature_tag_translations" validate constraint "creature_tag_translations_resource_id_fkey";

alter table "public"."creature_tags" add constraint "creature_tags_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."creature_tags" validate constraint "creature_tags_resource_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_creature_tag(p_campaign_id uuid, p_lang text, p_creature_tag jsonb, p_creature_tag_translation jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id uuid;
BEGIN
  v_id := public.create_resource(
    p_campaign_id,
    p_lang,
    p_creature_tag || jsonb_build_object('kind', 'creature_tag'::public.resource_kind),
    p_creature_tag_translation
  );

  INSERT INTO public.creature_tags (resource_id)
  VALUES (v_id);

  perform public.upsert_creature_tag_translation(v_id, p_lang, p_creature_tag_translation);

  RETURN v_id;
END;
$function$
;

create type "public"."creature_tag_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "page" jsonb);

CREATE OR REPLACE FUNCTION public.fetch_creature_tag(p_id uuid)
 RETURNS public.creature_tag_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT
    r.campaign_id,
    r.campaign_name,
    r.id,
    r.kind,
    r.visibility,
    r.name,
    r.page
  FROM public.fetch_resource(p_id) AS r
  JOIN public.creature_tags ct ON ct.resource_id = r.id
  WHERE r.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_creature_tags(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.creature_tag_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'creature_tag'::public.resource_kind
),
src AS (
  SELECT
    b.id,
    b.campaign_id,
    b.campaign_name,
    b.kind,
    b.visibility,
    b.name,
    b.page
  FROM base b
  JOIN public.creature_tags ct ON ct.resource_id = b.id
)
SELECT
  s.campaign_id,
  s.campaign_name,
  s.id,
  s.kind,
  s.visibility,
  s.name,
  s.page
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

CREATE OR REPLACE FUNCTION public.update_creature_tag(p_id uuid, p_lang text, p_creature_tag jsonb, p_creature_tag_translation jsonb)
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
    p_creature_tag || jsonb_build_object('kind', 'creature_tag'::public.resource_kind),
    p_creature_tag_translation
  );

  UPDATE public.creature_tags ct
  SET resource_id = ct.resource_id
  WHERE ct.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_creature_tag_translation(p_id, p_lang, p_creature_tag_translation);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_creature_tag_translation(p_id uuid, p_lang text, p_creature_tag_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.creature_tag_translations AS ctt (resource_id, lang)
  VALUES (p_id, p_lang)
  ON conflict (resource_id, lang) DO NOTHING;

  perform public.upsert_resource_translation(p_id, p_lang, p_creature_tag_translation);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_creature_tag_resource_kind()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'creature_tag'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a creature tag', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."creature_tag_translations" to "anon";

grant insert on table "public"."creature_tag_translations" to "anon";

grant references on table "public"."creature_tag_translations" to "anon";

grant select on table "public"."creature_tag_translations" to "anon";

grant trigger on table "public"."creature_tag_translations" to "anon";

grant truncate on table "public"."creature_tag_translations" to "anon";

grant update on table "public"."creature_tag_translations" to "anon";

grant delete on table "public"."creature_tag_translations" to "authenticated";

grant insert on table "public"."creature_tag_translations" to "authenticated";

grant references on table "public"."creature_tag_translations" to "authenticated";

grant select on table "public"."creature_tag_translations" to "authenticated";

grant trigger on table "public"."creature_tag_translations" to "authenticated";

grant truncate on table "public"."creature_tag_translations" to "authenticated";

grant update on table "public"."creature_tag_translations" to "authenticated";

grant delete on table "public"."creature_tag_translations" to "service_role";

grant insert on table "public"."creature_tag_translations" to "service_role";

grant references on table "public"."creature_tag_translations" to "service_role";

grant select on table "public"."creature_tag_translations" to "service_role";

grant trigger on table "public"."creature_tag_translations" to "service_role";

grant truncate on table "public"."creature_tag_translations" to "service_role";

grant update on table "public"."creature_tag_translations" to "service_role";

grant delete on table "public"."creature_tags" to "anon";

grant insert on table "public"."creature_tags" to "anon";

grant references on table "public"."creature_tags" to "anon";

grant select on table "public"."creature_tags" to "anon";

grant trigger on table "public"."creature_tags" to "anon";

grant truncate on table "public"."creature_tags" to "anon";

grant update on table "public"."creature_tags" to "anon";

grant delete on table "public"."creature_tags" to "authenticated";

grant insert on table "public"."creature_tags" to "authenticated";

grant references on table "public"."creature_tags" to "authenticated";

grant select on table "public"."creature_tags" to "authenticated";

grant trigger on table "public"."creature_tags" to "authenticated";

grant truncate on table "public"."creature_tags" to "authenticated";

grant update on table "public"."creature_tags" to "authenticated";

grant delete on table "public"."creature_tags" to "service_role";

grant insert on table "public"."creature_tags" to "service_role";

grant references on table "public"."creature_tags" to "service_role";

grant select on table "public"."creature_tags" to "service_role";

grant trigger on table "public"."creature_tags" to "service_role";

grant truncate on table "public"."creature_tags" to "service_role";

grant update on table "public"."creature_tags" to "service_role";


  create policy "Creators and GMs can create new creature tag translations"
  on "public"."creature_tag_translations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can delete creature tag translations"
  on "public"."creature_tag_translations"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update creature tag translations"
  on "public"."creature_tag_translations"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check (public.can_edit_resource(resource_id));



  create policy "Users can read creature tag translations"
  on "public"."creature_tag_translations"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Creators and GMs can create new creature tags"
  on "public"."creature_tags"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can delete creature tags"
  on "public"."creature_tags"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update creature tags"
  on "public"."creature_tags"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check (public.can_edit_resource(resource_id));



  create policy "Users can read creature tags"
  on "public"."creature_tags"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));


CREATE TRIGGER enforce_creature_tag_resource_kind BEFORE INSERT OR UPDATE ON public.creature_tags FOR EACH ROW EXECUTE FUNCTION public.validate_creature_tag_resource_kind();


