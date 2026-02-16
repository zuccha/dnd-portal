DROP FUNCTION public.fetch_resource(p_id uuid);
DROP FUNCTION public.fetch_resources(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);

drop type "public"."resource_row";

alter table "public"."resources" add column "source_id" uuid;

update public.resources
set source_id = campaign_id
where source_id is null;

alter table "public"."resources" add constraint "resources_source_id_fkey" FOREIGN KEY (source_id) REFERENCES public.sources(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."resources" validate constraint "resources_source_id_fkey";

create type "public"."resource_row" as ("id" uuid, "source_id" uuid, "campaign_id" uuid, "campaign_name" text, "kind" public.resource_kind, "visibility" public.campaign_role, "image_url" text, "name" jsonb, "name_short" jsonb, "page" jsonb);

CREATE OR REPLACE FUNCTION public.source_resource_ids(p_source_id uuid, p_source_filter jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(id uuid)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
  WITH prefs AS (
    SELECT
      -- include these ids
      (
        SELECT coalesce(array_agg(e.key::uuid), null)
        FROM jsonb_each_text(p_source_filter) AS e(key, value)
        WHERE e.value = 'true'
      ) AS ids_inc,
      -- exclude these ids
      (
        SELECT coalesce(array_agg(e.key::uuid), null)
        FROM jsonb_each_text(p_source_filter) AS e(key, value)
        WHERE e.value = 'false'
      ) AS ids_exc
  ),
  base_ids AS (
    SELECT p_source_id AS id
    UNION
    SELECT si.include_id
    FROM public.source_includes si
    WHERE si.source_id = p_source_id
  )
  SELECT b.id
  FROM base_ids b, prefs p
  WHERE (p.ids_inc IS NULL OR b.id = ANY(p.ids_inc))
    AND (p.ids_exc IS NULL OR NOT (b.id = ANY(p.ids_exc)));
$function$
;

CREATE OR REPLACE FUNCTION public.source_resource_ids_with_deps(p_source_id uuid, p_source_filter jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(id uuid)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
  WITH RECURSIVE prefs AS (
    SELECT
      -- include these ids
      (
        SELECT coalesce(array_agg(e.key::uuid), null)
        FROM jsonb_each_text(p_source_filter) AS e(key, value)
        WHERE e.value = 'true'
      ) AS ids_inc,
      -- exclude these ids
      (
        SELECT coalesce(array_agg(e.key::uuid), null)
        FROM jsonb_each_text(p_source_filter) AS e(key, value)
        WHERE e.value = 'false'
      ) AS ids_exc
  ),
  base_ids AS (
    SELECT p_source_id AS id
    UNION
    SELECT si.include_id
    FROM public.source_includes si
    WHERE si.source_id = p_source_id
  ),
  source_tree AS (
    SELECT b.id, ARRAY[b.id] AS path
    FROM base_ids b
    UNION ALL
    SELECT sr.required_id, st.path || sr.required_id
    FROM public.source_requires sr
    JOIN source_tree st ON sr.source_id = st.id
    WHERE NOT sr.required_id = ANY(st.path)
  ),
  all_ids AS (
    SELECT DISTINCT id FROM source_tree
  )
  SELECT a.id
  FROM all_ids a, prefs p
  WHERE (p.ids_inc IS NULL OR a.id = ANY(p.ids_inc))
    AND (p.ids_exc IS NULL OR NOT (a.id = ANY(p.ids_exc)));
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_resource(p_id uuid)
 RETURNS public.resource_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT
    r.id,
    r.source_id,
    r.campaign_id,
    c.name                          AS campaign_name,
    r.kind,
    r.visibility,
    r.image_url,
    coalesce(tt.name, '{}'::jsonb)  AS name,
    coalesce(tt.name_short, '{}'::jsonb) AS name_short,
    coalesce(tt.page, '{}'::jsonb)  AS page
  FROM public.resources r
  JOIN public.campaigns c ON c.id = r.campaign_id
  LEFT JOIN (
    SELECT
      r.id,
      jsonb_object_agg(t.lang, t.name) AS name,
      jsonb_object_agg(t.lang, t.name_short) AS name_short,
      jsonb_object_agg(t.lang, t.page) AS page
    FROM public.resources r
    LEFT JOIN public.resource_translations t ON t.resource_id = r.id
    WHERE r.id = p_id
    GROUP BY r.id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_resources(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.resource_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
  SELECT
    -- campaign/modules include/exclude filter (keys are campaign or module ids)
    coalesce(p_filters->'campaigns', '{}'::jsonb) AS campaign_filter,

    -- kinds
    (
      SELECT coalesce(array_agg(lower(e.key)::public.resource_kind), null)
      FROM jsonb_each_text(p_filters->'kinds') AS e(key, value)
      WHERE e.value = 'true'
    ) AS kinds_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.resource_kind), null)
      FROM jsonb_each_text(p_filters->'kinds') AS e(key, value)
      WHERE e.value = 'false'
    ) AS kinds_exc
),
src AS (
  SELECT r.*
  FROM public.resources r
  JOIN prefs p ON true
  JOIN public.campaign_resource_ids_with_deps(p_campaign_id, p.campaign_filter) ci ON ci.id = r.campaign_id
  JOIN public.campaigns c ON c.id = r.campaign_id
),
filtered AS (
  SELECT r.*
  FROM src r, prefs p
  WHERE
    (p.kinds_inc IS NULL OR r.kind = any(p.kinds_inc))
    AND (p.kinds_exc IS NULL OR NOT (r.kind = any(p.kinds_exc)))
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.name) AS name,
    jsonb_object_agg(t.lang, t.name_short) AS name_short,
    jsonb_object_agg(t.lang, t.page) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS page
  FROM filtered f
  LEFT JOIN public.resource_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
)
SELECT
  f.id,
  f.source_id,
  f.campaign_id,
  c.name                        AS campaign_name,
  f.kind,
  f.visibility,
  f.image_url,
  coalesce(tt.name, '{}'::jsonb) AS name,
  coalesce(tt.name_short, '{}'::jsonb) AS name_short,
  coalesce(tt.page, '{}'::jsonb) AS page
FROM filtered f
JOIN public.campaigns c ON c.id = f.campaign_id
LEFT JOIN t tt ON tt.id = f.id
ORDER BY
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'asc'
      THEN (tt.name->>coalesce(p_langs[1],'en'))
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'desc'
      THEN (tt.name->>coalesce(p_langs[1],'en'))
  END DESC NULLS LAST;
$function$
;

CREATE OR REPLACE FUNCTION public.update_resource(p_id uuid, p_lang text, p_resource jsonb, p_resource_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_rows int;
BEGIN
  UPDATE public.resources r
  SET (
    visibility, kind, image_url, source_id
  ) = (
    SELECT rr.visibility, rr.kind, rr.image_url, rr.source_id
    FROM jsonb_populate_record(null::public.resources, to_jsonb(r) || p_resource) AS rr
  )
  WHERE r.id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_resource_translation(p_id, p_lang, p_resource_translation);
END;
$function$
;

