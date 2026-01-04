drop function if exists "public"."fetch_resource_options"(p_campaign_id uuid, p_resource_kind public.resource_kind);

-- set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fetch_resource_options(p_campaign_id uuid, p_resource_kinds public.resource_kind[])
 RETURNS TABLE(id uuid, name jsonb)
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  WITH campaign_ids AS (
    SELECT p_campaign_id AS id
    UNION
    SELECT cm.module_id
    FROM public.campaign_modules cm
    WHERE cm.campaign_id = p_campaign_id
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


