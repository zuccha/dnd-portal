
  create table "public"."plane_translations" (
    "resource_id" uuid not null,
    "lang" text not null
      );


alter table "public"."plane_translations" enable row level security;


  create table "public"."planes" (
    "resource_id" uuid not null,
    "alignments" public.creature_alignment[] not null
      );


alter table "public"."planes" enable row level security;

CREATE UNIQUE INDEX plane_translations_pkey ON public.plane_translations USING btree (resource_id, lang);

CREATE UNIQUE INDEX planes_pkey ON public.planes USING btree (resource_id);

alter table "public"."plane_translations" add constraint "plane_translations_pkey" PRIMARY KEY using index "plane_translations_pkey";

alter table "public"."planes" add constraint "planes_pkey" PRIMARY KEY using index "planes_pkey";

alter table "public"."plane_translations" add constraint "plane_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."plane_translations" validate constraint "plane_translations_lang_fkey";

alter table "public"."plane_translations" add constraint "plane_translations_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.planes(resource_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."plane_translations" validate constraint "plane_translations_resource_id_fkey";

alter table "public"."planes" add constraint "planes_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."planes" validate constraint "planes_resource_id_fkey";

create type "public"."plane_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "page" jsonb, "alignments" public.creature_alignment[]);

CREATE OR REPLACE FUNCTION public.create_plane(p_campaign_id uuid, p_lang text, p_plane jsonb, p_plane_translation jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id uuid;
  r public.planes%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.planes, p_plane);

  v_id := public.create_resource(
    p_campaign_id,
    p_lang,
    p_plane || jsonb_build_object('kind', 'plane'::public.resource_kind),
    p_plane_translation
  );

  INSERT INTO public.planes (
    resource_id, alignments
  ) VALUES (
    v_id, r.alignments
  );

  perform public.upsert_plane_translation(v_id, p_lang, p_plane_translation);

  RETURN v_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_plane(p_id uuid)
 RETURNS public.plane_row
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
    r.page,
    p.alignments
  FROM public.fetch_resource(p_id) AS r
  JOIN public.planes p ON p.resource_id = r.id
  WHERE r.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_planes(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.plane_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'plane'::public.resource_kind
),
src AS (
  SELECT
    b.id,
    b.campaign_id,
    b.campaign_name,
    b.kind,
    b.visibility,
    b.name,
    b.page,
    p.alignments
  FROM base b
  JOIN public.planes p ON p.resource_id = b.id
)
SELECT
  s.campaign_id,
  s.campaign_name,
  s.id,
  s.kind,
  s.visibility,
  s.name,
  s.page,
  s.alignments
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

CREATE OR REPLACE FUNCTION public.update_plane(p_id uuid, p_lang text, p_plane jsonb, p_plane_translation jsonb)
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
    p_plane || jsonb_build_object('kind', 'plane'::public.resource_kind),
    p_plane_translation
  );

  UPDATE public.planes p
  SET (
    alignments
  ) = (
    SELECT r.alignments
    FROM jsonb_populate_record(null::public.planes, to_jsonb(p) || p_plane) AS r
  )
  WHERE p.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_plane_translation(p_id, p_lang, p_plane_translation);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_plane_translation(p_id uuid, p_lang text, p_plane_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  r public.plane_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.plane_translations, p_plane_translation);

  INSERT INTO public.plane_translations AS pt (
    resource_id, lang
  ) VALUES (
    p_id, p_lang
  )
  ON conflict (resource_id, lang) DO NOTHING;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_plane_resource_kind()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'plane'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a plane', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."plane_translations" to "anon";

grant insert on table "public"."plane_translations" to "anon";

grant references on table "public"."plane_translations" to "anon";

grant select on table "public"."plane_translations" to "anon";

grant trigger on table "public"."plane_translations" to "anon";

grant truncate on table "public"."plane_translations" to "anon";

grant update on table "public"."plane_translations" to "anon";

grant delete on table "public"."plane_translations" to "authenticated";

grant insert on table "public"."plane_translations" to "authenticated";

grant references on table "public"."plane_translations" to "authenticated";

grant select on table "public"."plane_translations" to "authenticated";

grant trigger on table "public"."plane_translations" to "authenticated";

grant truncate on table "public"."plane_translations" to "authenticated";

grant update on table "public"."plane_translations" to "authenticated";

grant delete on table "public"."plane_translations" to "service_role";

grant insert on table "public"."plane_translations" to "service_role";

grant references on table "public"."plane_translations" to "service_role";

grant select on table "public"."plane_translations" to "service_role";

grant trigger on table "public"."plane_translations" to "service_role";

grant truncate on table "public"."plane_translations" to "service_role";

grant update on table "public"."plane_translations" to "service_role";

grant delete on table "public"."planes" to "anon";

grant insert on table "public"."planes" to "anon";

grant references on table "public"."planes" to "anon";

grant select on table "public"."planes" to "anon";

grant trigger on table "public"."planes" to "anon";

grant truncate on table "public"."planes" to "anon";

grant update on table "public"."planes" to "anon";

grant delete on table "public"."planes" to "authenticated";

grant insert on table "public"."planes" to "authenticated";

grant references on table "public"."planes" to "authenticated";

grant select on table "public"."planes" to "authenticated";

grant trigger on table "public"."planes" to "authenticated";

grant truncate on table "public"."planes" to "authenticated";

grant update on table "public"."planes" to "authenticated";

grant delete on table "public"."planes" to "service_role";

grant insert on table "public"."planes" to "service_role";

grant references on table "public"."planes" to "service_role";

grant select on table "public"."planes" to "service_role";

grant trigger on table "public"."planes" to "service_role";

grant truncate on table "public"."planes" to "service_role";

grant update on table "public"."planes" to "service_role";


  create policy "Creators and GMs can create new plane translations"
  on "public"."plane_translations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can delete plane translations"
  on "public"."plane_translations"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update plane translations"
  on "public"."plane_translations"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check (public.can_edit_resource(resource_id));



  create policy "Users can read plane translations"
  on "public"."plane_translations"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Creators and GMs can create new planes"
  on "public"."planes"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can delete planes"
  on "public"."planes"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update planes"
  on "public"."planes"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check (public.can_edit_resource(resource_id));



  create policy "Users can read planes"
  on "public"."planes"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));


CREATE TRIGGER enforce_plane_resource_kind BEFORE INSERT OR UPDATE ON public.planes FOR EACH ROW EXECUTE FUNCTION public.validate_plane_resource_kind();


