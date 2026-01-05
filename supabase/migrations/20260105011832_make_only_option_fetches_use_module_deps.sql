CREATE OR REPLACE FUNCTION public.campaign_resource_ids_with_deps(p_campaign_id uuid, p_campaign_filter jsonb DEFAULT '{}'::jsonb)
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
        FROM jsonb_each_text(p_campaign_filter) AS e(key, value)
        WHERE e.value = 'true'
      ) AS ids_inc,
      -- exclude these ids
      (
        SELECT coalesce(array_agg(e.key::uuid), null)
        FROM jsonb_each_text(p_campaign_filter) AS e(key, value)
        WHERE e.value = 'false'
      ) AS ids_exc
  ),
  base_ids AS (
    SELECT p_campaign_id AS id
    UNION
    SELECT cm.module_id
    FROM public.campaign_modules cm
    WHERE cm.campaign_id = p_campaign_id
  ),
  module_tree AS (
    SELECT b.id, ARRAY[b.id] AS path
    FROM base_ids b
    UNION ALL
    SELECT md.dependency_id, mt.path || md.dependency_id
    FROM public.module_dependencies md
    JOIN module_tree mt ON md.module_id = mt.id
    WHERE NOT md.dependency_id = ANY(mt.path)
  ),
  all_ids AS (
    SELECT DISTINCT id FROM module_tree
  )
  SELECT a.id
  FROM all_ids a, prefs p
  WHERE (p.ids_inc IS NULL OR a.id = ANY(p.ids_inc))
    AND (p.ids_exc IS NULL OR NOT (a.id = ANY(p.ids_exc)));
$function$
;

CREATE OR REPLACE FUNCTION public.campaign_resource_ids(p_campaign_id uuid, p_campaign_filter jsonb DEFAULT '{}'::jsonb)
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
        FROM jsonb_each_text(p_campaign_filter) AS e(key, value)
        WHERE e.value = 'true'
      ) AS ids_inc,
      -- exclude these ids
      (
        SELECT coalesce(array_agg(e.key::uuid), null)
        FROM jsonb_each_text(p_campaign_filter) AS e(key, value)
        WHERE e.value = 'false'
      ) AS ids_exc
  ),
  base_ids AS (
    SELECT p_campaign_id AS id
    UNION
    SELECT cm.module_id
    FROM public.campaign_modules cm
    WHERE cm.campaign_id = p_campaign_id
  )
  SELECT b.id
  FROM base_ids b, prefs p
  WHERE (p.ids_inc IS NULL OR b.id = ANY(p.ids_inc))
    AND (p.ids_exc IS NULL OR NOT (b.id = ANY(p.ids_exc)));
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_resource_options(p_campaign_id uuid, p_resource_kinds public.resource_kind[])
 RETURNS TABLE(id uuid, name jsonb)
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  WITH campaign_ids AS (
    SELECT id
    FROM public.campaign_resource_ids_with_deps(p_campaign_id, '{}'::jsonb)
  )
  SELECT
    r.id,
    coalesce(tt.name, '{}'::jsonb) AS name
  FROM public.resources r
  JOIN campaign_ids cids ON cids.id = r.campaign_id
  LEFT JOIN (
    SELECT
      rt.resource_id AS id,
      jsonb_object_agg(rt.lang, rt.name) AS name
    FROM public.resource_translations rt
    GROUP BY rt.resource_id
  ) tt ON tt.id = r.id
  WHERE r.kind = any(p_resource_kinds)
  ORDER BY r.id;
$function$
;


