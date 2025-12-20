set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fetch_campaign_modules(p_campaign_id uuid)
 RETURNS TABLE(id uuid, name text)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT m.id, m.name
  FROM public.campaign_modules cm
  JOIN public.campaigns m ON m.id = cm.module_id
  WHERE cm.campaign_id = p_campaign_id
    AND m.is_module = true
  ORDER BY m.name;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_campaigns()
 RETURNS TABLE(id uuid, name text, modules jsonb)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT
    c.id,
    c.name,
    coalesce(
      jsonb_agg(
        jsonb_build_object('id', m.id, 'name', m.name)
        ORDER BY m.name
      ) FILTER (WHERE m.id IS NOT NULL),
      '[]'::jsonb
    ) AS modules
  FROM public.campaigns c
  LEFT JOIN public.campaign_modules cm ON cm.campaign_id = c.id
  LEFT JOIN public.campaigns m ON m.id = cm.module_id AND m.is_module = true
  WHERE c.is_module = false
  GROUP BY c.id, c.name
  ORDER BY c.name;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_modules()
 RETURNS TABLE(id uuid, name text)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT c.id, c.name
  FROM public.campaigns c
  WHERE c.is_module = true
  ORDER BY c.name;
$function$
;


