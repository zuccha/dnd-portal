set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.validate_campaign_module_is_module()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = NEW.module_id AND is_module = true
  ) THEN
    RAISE EXCEPTION 'Referenced campaign % is not a module', NEW.module_id;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_user_module_is_module()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = NEW.module_id AND is_module = true
  ) THEN
    RAISE EXCEPTION 'Referenced campaign % is not a module', NEW.module_id;
  END IF;
  RETURN NEW;
END;
$function$
;


