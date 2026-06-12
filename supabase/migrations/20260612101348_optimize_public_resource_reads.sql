CREATE INDEX IF NOT EXISTS idx_resources_source_id_kind_visibility
  ON public.resources USING btree (source_id, kind, visibility);

CREATE OR REPLACE FUNCTION public.can_read_resource(p_resource_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.resources r
    LEFT JOIN public.sources s ON s.id = r.source_id
    WHERE r.id = p_resource_id
      AND (
        s.creator_id = (SELECT auth.uid() AS uid)
        OR EXISTS (
          SELECT 1 FROM public.source_roles sr
          WHERE sr.source_id = r.source_id
            AND sr.user_id = (SELECT auth.uid() AS uid)
            AND sr.role IN ('admin'::public.source_role, 'editor'::public.source_role)
        )
        OR (
          r.visibility = 'public'::public.resource_visibility
          AND (
            s.visibility IN ('public'::public.source_visibility, 'purchasable'::public.source_visibility)
            OR EXISTS (
              SELECT 1 FROM public.source_ownerships so
              WHERE so.source_id = r.source_id
                AND so.user_id = (SELECT auth.uid() AS uid)
            )
            OR EXISTS (
              SELECT 1 FROM public.source_roles sr
              WHERE sr.source_id = r.source_id
                AND sr.user_id = (SELECT auth.uid() AS uid)
            )
          )
        )
      )
  );
$$;

ALTER FUNCTION public.can_read_resource(p_resource_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_read_resource(p_resource_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_read_resource(p_resource_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_read_resource(p_resource_id uuid) TO service_role;
