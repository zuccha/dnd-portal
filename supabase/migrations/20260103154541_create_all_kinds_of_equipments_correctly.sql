set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.validate_equipment_resource_kind()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = any(ARRAY[
        'equipment'::public.resource_kind,
        'armor'::public.resource_kind,
        'weapon'::public.resource_kind,
        'tool'::public.resource_kind,
        'item'::public.resource_kind
      ])
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not an equipment', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$function$
;


