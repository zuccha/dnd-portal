set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fetch_campaign_role(p_campaign_id uuid)
 RETURNS public.campaign_role
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT cp.role
  FROM public.campaign_players cp
  WHERE cp.campaign_id = p_campaign_id
    AND cp.user_id = auth.uid()
  LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_module_role(p_module_id uuid)
 RETURNS public.module_role
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT um.role
  FROM public.user_modules um
  WHERE um.module_id = p_module_id
    AND um.user_id = auth.uid()
  LIMIT 1;
$function$
;


