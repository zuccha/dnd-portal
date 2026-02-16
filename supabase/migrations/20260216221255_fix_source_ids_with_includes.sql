DROP FUNCTION public.fetch_resource_lookups(p_source_id uuid, p_resource_kinds public.resource_kind[]);

DROP FUNCTION public.fetch_resources(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);

drop function if exists "public"."source_resource_ids"(p_source_id uuid, p_source_filter jsonb);

drop function if exists "public"."source_resource_ids_with_deps"(p_source_id uuid, p_source_filter jsonb);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.source_ids_with_includes(p_source_id uuid, p_source_filter jsonb DEFAULT '{}'::jsonb)
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
  source_tree AS (
    SELECT p_source_id AS id, ARRAY[p_source_id] AS path
    UNION ALL
    SELECT si.include_id, st.path || si.include_id
    FROM public.source_includes si
    JOIN source_tree st ON si.source_id = st.id
    WHERE NOT si.include_id = ANY(st.path)
  ),
  base_ids AS (
    SELECT DISTINCT id FROM source_tree
  )
  SELECT b.id
  FROM base_ids b, prefs p
  WHERE (p.ids_inc IS NULL OR b.id = ANY(p.ids_inc))
    AND (p.ids_exc IS NULL OR NOT (b.id = ANY(p.ids_exc)));
$function$
;

CREATE OR REPLACE FUNCTION public.source_ids_with_includes_and_requires(p_source_id uuid, p_source_filter jsonb DEFAULT '{}'::jsonb)
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
  include_tree AS (
    SELECT p_source_id AS id, ARRAY[p_source_id] AS path
    UNION ALL
    SELECT si.include_id, it.path || si.include_id
    FROM public.source_includes si
    JOIN include_tree it ON si.source_id = it.id
    WHERE NOT si.include_id = ANY(it.path)
  ),
  base_ids AS (
    SELECT DISTINCT id FROM include_tree
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

CREATE OR REPLACE FUNCTION public.fetch_resource_lookups(p_source_id uuid, p_resource_kinds public.resource_kind[])
 RETURNS TABLE(id uuid, name jsonb, name_short jsonb)
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  WITH source_ids AS (
    SELECT id
    FROM public.source_ids_with_includes_and_requires(p_source_id, '{}'::jsonb)
  )
  SELECT
    r.id,
    coalesce(tt.name, '{}'::jsonb) AS name,
    coalesce(tt.name_short, '{}'::jsonb) AS name_short
  FROM public.resources r
  JOIN source_ids sids ON sids.id = r.source_id
  LEFT JOIN (
    SELECT
      rt.resource_id AS id,
      jsonb_object_agg(rt.lang, rt.name) AS name,
      jsonb_object_agg(rt.lang, rt.name_short) AS name_short
    FROM public.resource_translations rt
    GROUP BY rt.resource_id
  ) tt ON tt.id = r.id
  WHERE r.kind = any(p_resource_kinds)
  ORDER BY r.id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_resources(p_source_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.resource_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
  SELECT
    -- sources include/exclude filter (keys are source ids)
    coalesce(p_filters->'sources', '{}'::jsonb) AS source_filter,

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
  JOIN public.source_ids_with_includes(p_source_id, p.source_filter) si ON si.id = r.source_id
  LEFT JOIN public.sources s ON s.id = r.source_id
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
  s.code                        AS source_code,
  f.kind,
  f.visibility,
  f.image_url,
  coalesce(tt.name, '{}'::jsonb) AS name,
  coalesce(tt.name_short, '{}'::jsonb) AS name_short,
  coalesce(tt.page, '{}'::jsonb) AS page
FROM filtered f
LEFT JOIN public.sources s ON s.id = f.source_id
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


