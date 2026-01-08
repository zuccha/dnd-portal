create type "public"."plane_category" as enum ('material', 'transitive', 'inner', 'outer', 'other');

drop function public.fetch_plane(uuid);
drop function public.fetch_planes(uuid, text[], jsonb, text, text);

drop type "public"."plane_row";

alter table "public"."planes" add column "category" public.plane_category not null;

create type "public"."plane_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "page" jsonb, "category" public.plane_category, "alignments" public.creature_alignment[]);

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
    resource_id, category, alignments
  ) VALUES (
    v_id, r.category, r.alignments
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
    p.category,
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
    p.category,
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
  s.category,
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
    category,
    alignments
  ) = (
    SELECT r.category, r.alignments
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


