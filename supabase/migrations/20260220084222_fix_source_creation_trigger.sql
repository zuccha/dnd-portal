set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.validate_source_ownership_write()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- allow the source creator bootstrap (e.g., inserts via triggers)
  IF pg_trigger_depth() > 0 THEN
    IF EXISTS (
      SELECT 1
      FROM public.sources s
      WHERE s.id = NEW.source_id
        AND s.creator_id = NEW.user_id
    ) THEN
      RETURN NEW;
    END IF;
  END IF;

  -- only admins can grant ownership or guest
  IF NOT public.can_admin_source(NEW.source_id) THEN
    RAISE EXCEPTION 'Only admins can manage ownerships';
  END IF;
  RETURN NEW;
END;
$function$
;


