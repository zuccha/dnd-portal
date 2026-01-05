set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.campaign_resource_ids(p_campaign_id uuid, p_campaign_filter jsonb DEFAULT '{}'::jsonb)
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


