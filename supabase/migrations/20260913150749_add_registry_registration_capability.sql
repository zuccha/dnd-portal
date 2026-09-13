--------------------------------------------------------------------------------
-- CAN REGISTER REGISTRY SOURCE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_register_registry_source()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.registry_publishers publisher
    WHERE publisher.user_id = (SELECT auth.uid() AS uid)
  );
$$;

ALTER FUNCTION public.can_register_registry_source() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.can_register_registry_source()
  TO authenticated;
