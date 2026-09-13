--------------------------------------------------------------------------------
-- UPDATE REGISTRY SOURCE VISIBILITY
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_registry_source_visibility(
  p_source_id uuid,
  p_visibility public.registry_source_visibility
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  UPDATE public.registry_sources
  SET visibility = p_visibility
  WHERE source_id = p_source_id
    AND creator_id = (SELECT auth.uid() AS uid);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only the registry source creator can update visibility'
      USING ERRCODE = '42501';
  END IF;
END;
$$;

ALTER FUNCTION public.update_registry_source_visibility(
  uuid,
  public.registry_source_visibility
) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.update_registry_source_visibility(
  uuid,
  public.registry_source_visibility
) TO authenticated;
