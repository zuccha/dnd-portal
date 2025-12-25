drop policy "Creators and GMs can create new eldritch invocation translation" on "public"."eldritch_invocation_translations";

drop policy "Creators and GMs can delete eldritch invocation translations" on "public"."eldritch_invocation_translations";

drop policy "Creators and GMs can update eldritch invocation translations" on "public"."eldritch_invocation_translations";

drop policy "Users can read eldritch invocation translations" on "public"."eldritch_invocation_translations";

drop policy "Creators and GMs can create new eldritch invocations" on "public"."eldritch_invocations";

drop policy "Creators and GMs can delete eldritch invocations" on "public"."eldritch_invocations";

drop policy "Creators and GMs can update eldritch invocations" on "public"."eldritch_invocations";

drop policy "Users can read eldritch invocations" on "public"."eldritch_invocations";

alter table "public"."eldritch_invocation_translations" drop constraint "eldritch_invocation_translations_eldritch_invocation_id_fkey";

alter table "public"."eldritch_invocation_translations" drop constraint "eldritch_invocation_translations_lang_fkey";

alter table "public"."eldritch_invocations" drop constraint "eldritch_invocations_campaign_id_fkey";

drop function if exists "public"."can_edit_eldritch_invocation_translation"(p_eldritch_invocation_id uuid);

drop function if exists "public"."can_read_eldritch_invocation_translation"(p_eldritch_invocation_id uuid);

drop function if exists "public"."fetch_eldritch_invocations"(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);

alter table "public"."eldritch_invocation_translations" drop constraint "eldritch_invocation_translations_pkey";

alter table "public"."eldritch_invocations" drop constraint "eldritch_invocations_pkey";

drop index if exists "public"."eldritch_invocation_translations_pkey";

drop index if exists "public"."eldritch_invocations_pkey";

alter table "public"."eldritch_invocation_translations" rename column "eldritch_invocation_id" to "resource_id";

alter table "public"."eldritch_invocation_translations" drop column "name";

alter table "public"."eldritch_invocation_translations" drop column "page";

alter table "public"."eldritch_invocations" drop column "campaign_id";

alter table "public"."eldritch_invocations" rename column "id" to "resource_id";

alter table "public"."eldritch_invocations" drop column "visibility";

CREATE UNIQUE INDEX eldritch_invocation_translations_r_pkey ON public.eldritch_invocation_translations USING btree (resource_id, lang);

CREATE UNIQUE INDEX eldritch_invocations_pkey ON public.eldritch_invocations USING btree (resource_id);

alter table "public"."eldritch_invocation_translations" add constraint "eldritch_invocation_translations_r_pkey" PRIMARY KEY using index "eldritch_invocation_translations_r_pkey";

alter table "public"."eldritch_invocations" add constraint "eldritch_invocations_pkey" PRIMARY KEY using index "eldritch_invocations_pkey";

alter table "public"."eldritch_invocation_translations" add constraint "eldritch_invocation_translations_r_lang_fkey" FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."eldritch_invocation_translations" validate constraint "eldritch_invocation_translations_r_lang_fkey";

alter table "public"."eldritch_invocation_translations" add constraint "eldritch_invocation_translations_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.eldritch_invocations(resource_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."eldritch_invocation_translations" validate constraint "eldritch_invocation_translations_resource_id_fkey";

alter table "public"."eldritch_invocations" add constraint "eldritch_invocations_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."eldritch_invocations" validate constraint "eldritch_invocations_resource_id_fkey";

set check_function_bodies = off;

create type "public"."eldritch_invocation_row" as ("id" uuid, "campaign_id" uuid, "campaign_name" text, "visibility" public.campaign_role, "name" jsonb, "page" jsonb, "min_warlock_level" smallint, "prerequisite" jsonb, "description" jsonb);

CREATE OR REPLACE FUNCTION public.validate_eldritch_invocation_resource_kind()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'eldritch_invocation'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not an eldritch invocation', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_eldritch_invocation(p_campaign_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id uuid;
  ei public.eldritch_invocations%ROWTYPE;
BEGIN
  ei := jsonb_populate_record(null::public.eldritch_invocations, p_eldritch_invocation);

  v_id := public.create_resource(
    p_campaign_id,
    p_lang,
    p_eldritch_invocation || jsonb_build_object('kind', 'eldritch_invocation'::public.resource_kind),
    p_eldritch_invocation_translation
  );

  INSERT INTO public.eldritch_invocations (
    resource_id, min_warlock_level
  ) VALUES (
    v_id, ei.min_warlock_level
  );

  perform public.upsert_eldritch_invocation_translation(v_id, p_lang, p_eldritch_invocation_translation);

  RETURN v_id;
END;
$function$
;

DROP FUNCTION IF EXISTS public.fetch_eldritch_invocation(uuid);
CREATE OR REPLACE FUNCTION public.fetch_eldritch_invocation(p_id uuid)
 RETURNS public.eldritch_invocation_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT
    r.id,
    r.campaign_id,
    r.campaign_name,
    ei.min_warlock_level,
    r.name,
    r.page,
    coalesce(tt.prerequisite, '{}'::jsonb) AS prerequisite,
    coalesce(tt.description, '{}'::jsonb)  AS description,
    r.visibility
  FROM public.fetch_resource(p_id) AS r
  JOIN public.eldritch_invocations ei ON ei.resource_id = r.id
  LEFT JOIN (
    SELECT
      ei.resource_id AS id,
      jsonb_object_agg(t.lang, t.prerequisite) AS prerequisite,
      jsonb_object_agg(t.lang, t.description)  AS description
    FROM public.eldritch_invocations ei
    LEFT JOIN public.eldritch_invocation_translations t ON t.resource_id = ei.resource_id
    WHERE ei.resource_id = p_id
    GROUP BY ei.resource_id
  ) tt ON tt.id = r.id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_eldritch_invocations(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.eldritch_invocation_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
  SELECT coalesce((p_filters->>'warlock_level')::int, 20) AS warlock_level
),
base AS (
  SELECT r.*
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'eldritch_invocation'::public.resource_kind
),
eldritch AS (
  SELECT b.*, e.min_warlock_level
  FROM base b
  JOIN public.eldritch_invocations e ON e.resource_id = b.id
),
filtered AS (
  SELECT e.*
  FROM eldritch e, prefs p
  WHERE e.min_warlock_level <= p.warlock_level
),
et AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.prerequisite) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS prerequisite,
    jsonb_object_agg(t.lang, t.description)  FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description
  FROM filtered f
  LEFT JOIN public.eldritch_invocation_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
)
SELECT
  f.id,
  f.campaign_id,
  f.campaign_name,
  f.min_warlock_level,
  f.name,
  f.page,
  coalesce(et.prerequisite, '{}'::jsonb) AS prerequisite,
  coalesce(et.description, '{}'::jsonb)  AS description,
  f.visibility
FROM filtered f
LEFT JOIN et ON et.id = f.id
ORDER BY
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'asc'
      THEN (f.name->>coalesce(p_langs[1],'en'))
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'desc'
      THEN (f.name->>coalesce(p_langs[1],'en'))
  END DESC NULLS LAST;
$function$
;

CREATE OR REPLACE FUNCTION public.update_eldritch_invocation(p_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb)
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
    p_eldritch_invocation || jsonb_build_object('kind', 'eldritch_invocation'::public.resource_kind),
    p_eldritch_invocation_translation
  );

  UPDATE public.eldritch_invocations e
  SET (
    min_warlock_level
  ) = (
    SELECT ee.min_warlock_level
    FROM jsonb_populate_record(null::public.eldritch_invocations, to_jsonb(e) || p_eldritch_invocation) AS ee
  )
  WHERE e.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_eldritch_invocation_translation(p_id, p_lang, p_eldritch_invocation_translation);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_eldritch_invocation_translation(p_id uuid, p_lang text, p_eldritch_invocation_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  r public.eldritch_invocation_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.eldritch_invocation_translations, p_eldritch_invocation_translation);

  INSERT INTO public.eldritch_invocation_translations AS st (
    resource_id, lang, prerequisite, description
  ) VALUES (
    p_id, p_lang, r.prerequisite, r.description
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    prerequisite = excluded.prerequisite,
    description = excluded.description;
END;
$function$
;


  create policy "Creators and GMs can create new eldritch invocation translation"
  on "public"."eldritch_invocation_translations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can delete eldritch invocation translations"
  on "public"."eldritch_invocation_translations"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update eldritch invocation translations"
  on "public"."eldritch_invocation_translations"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check (public.can_edit_resource(resource_id));



  create policy "Users can read eldritch invocation translations"
  on "public"."eldritch_invocation_translations"
  as permissive
  for select
  to authenticated
using ((public.can_read_resource(resource_id) OR public.can_edit_resource(resource_id)));



  create policy "Creators and GMs can create new eldritch invocations"
  on "public"."eldritch_invocations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can delete eldritch invocations"
  on "public"."eldritch_invocations"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update eldritch invocations"
  on "public"."eldritch_invocations"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check (public.can_edit_resource(resource_id));



  create policy "Users can read eldritch invocations"
  on "public"."eldritch_invocations"
  as permissive
  for select
  to authenticated
using ((public.can_read_resource(resource_id) OR public.can_edit_resource(resource_id)));


CREATE TRIGGER enforce_eldritch_invocation_resource_kind BEFORE INSERT OR UPDATE ON public.eldritch_invocations FOR EACH ROW EXECUTE FUNCTION public.validate_eldritch_invocation_resource_kind();


