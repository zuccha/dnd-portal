--------------------------------------------------------------------------------
-- REMOVE REDUNDANT REGISTRY SOURCE ID
--------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can read registry sources"
  ON public.registry_sources;
DROP POLICY IF EXISTS "Creators can create registry sources"
  ON public.registry_sources;
DROP POLICY IF EXISTS "Users can read registry revisions"
  ON public.registry_revisions;
DROP POLICY IF EXISTS "Users can read registry source access"
  ON public.registry_source_access;
DROP POLICY IF EXISTS "Creators can manage registry source access"
  ON public.registry_source_access;

ALTER TABLE public.registry_revisions
  DROP CONSTRAINT registry_revisions_registry_source_id_fkey;

ALTER TABLE public.registry_source_access
  DROP CONSTRAINT registry_source_access_registry_source_id_fkey;

ALTER TABLE public.registry_sources
  DROP CONSTRAINT registry_sources_current_revision_fkey;

ALTER TABLE public.registry_revisions
  DROP CONSTRAINT registry_revisions_source_number_key,
  ADD COLUMN source_id uuid;

UPDATE public.registry_revisions revision
SET source_id = source.source_id
FROM public.registry_sources source
WHERE source.id = revision.registry_source_id;

ALTER TABLE public.registry_revisions
  DROP COLUMN registry_source_id,
  ALTER COLUMN source_id SET NOT NULL;

ALTER TABLE public.registry_source_access
  DROP CONSTRAINT registry_source_access_pkey,
  ADD COLUMN source_id uuid;

UPDATE public.registry_source_access access
SET source_id = source.source_id
FROM public.registry_sources source
WHERE source.id = access.registry_source_id;

ALTER TABLE public.registry_source_access
  DROP COLUMN registry_source_id,
  ALTER COLUMN source_id SET NOT NULL;

ALTER TABLE public.registry_sources
  DROP CONSTRAINT registry_sources_pkey,
  DROP CONSTRAINT registry_sources_source_id_key,
  DROP COLUMN id,
  ADD CONSTRAINT registry_sources_pkey PRIMARY KEY (source_id),
  ADD CONSTRAINT registry_sources_current_revision_fkey
    FOREIGN KEY (current_revision_id)
    REFERENCES public.registry_revisions(id);

ALTER TABLE public.registry_revisions
  ADD CONSTRAINT registry_revisions_source_id_fkey
    FOREIGN KEY (source_id)
    REFERENCES public.registry_sources(source_id)
    ON DELETE CASCADE,
  ADD CONSTRAINT registry_revisions_source_number_key
    UNIQUE (source_id, revision_number);

ALTER TABLE public.registry_source_access
  ADD CONSTRAINT registry_source_access_source_id_fkey
    FOREIGN KEY (source_id)
    REFERENCES public.registry_sources(source_id)
    ON DELETE CASCADE,
  ADD CONSTRAINT registry_source_access_pkey
    PRIMARY KEY (source_id, user_id);

--------------------------------------------------------------------------------
-- REGISTRY SOURCE ACCESS HELPERS
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.can_read_registry_source(uuid);

CREATE OR REPLACE FUNCTION public.can_read_registry_source(p_source_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.registry_sources source
    WHERE source.source_id = p_source_id
      AND (
        source.creator_id = (SELECT auth.uid() AS uid)
        OR EXISTS (
          SELECT 1
          FROM public.registry_source_access access
          WHERE access.source_id = source.source_id
            AND access.user_id = (SELECT auth.uid() AS uid)
            AND access.access IN ('read', 'write')
        )
      )
  );
$$;

ALTER FUNCTION public.can_read_registry_source(uuid) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.can_read_registry_source(uuid)
  TO anon, authenticated, service_role;

--------------------------------------------------------------------------------
-- REGISTRY SOURCE WRITE ACCESS
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.can_write_registry_source(uuid);

CREATE OR REPLACE FUNCTION public.can_write_registry_source(p_source_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.registry_sources source
    WHERE source.source_id = p_source_id
      AND (
        source.creator_id = (SELECT auth.uid() AS uid)
        OR EXISTS (
          SELECT 1
          FROM public.registry_source_access access
          WHERE access.source_id = source.source_id
            AND access.user_id = (SELECT auth.uid() AS uid)
            AND access.access = 'write'
        )
      )
  );
$$;

ALTER FUNCTION public.can_write_registry_source(uuid) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.can_write_registry_source(uuid)
  TO authenticated, service_role;

--------------------------------------------------------------------------------
-- PUBLISH REGISTRY SOURCE REVISION
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.publish_registry_source_revision(uuid, uuid, text);

CREATE OR REPLACE FUNCTION public.publish_registry_source_revision(
  p_source_id uuid,
  p_base_revision_id uuid,
  p_storage_path text
)
RETURNS TABLE(
  revision_id uuid,
  revision_number bigint,
  revision_created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  source public.registry_sources%ROWTYPE;
  revision public.registry_revisions%ROWTYPE;
BEGIN
  IF NOT public.can_write_registry_source(p_source_id) THEN
    RAISE EXCEPTION 'User cannot publish this registry source'
      USING ERRCODE = '42501';
  END IF;

  IF p_storage_path IS NULL
     OR p_storage_path NOT LIKE 'sources/' || p_source_id::text || '/%' THEN
    RAISE EXCEPTION 'Invalid registry bundle storage path'
      USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO source
  FROM public.registry_sources
  WHERE source_id = p_source_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registry source not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF source.current_revision_id IS DISTINCT FROM p_base_revision_id THEN
    RAISE EXCEPTION 'Registry source has changed since the submitted revision'
      USING ERRCODE = '40001';
  END IF;

  INSERT INTO public.registry_revisions (
    source_id,
    revision_number,
    created_by,
    storage_path
  )
  VALUES (
    source.source_id,
    source.current_revision_number + 1,
    (SELECT auth.uid() AS uid),
    p_storage_path
  )
  RETURNING * INTO revision;

  UPDATE public.registry_sources
  SET current_revision_id = revision.id,
      current_revision_number = revision.revision_number
  WHERE source_id = source.source_id;

  RETURN QUERY
  SELECT revision.id, revision.revision_number, revision.revision_created_at;
END;
$$;

ALTER FUNCTION public.publish_registry_source_revision(uuid, uuid, text)
  OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.publish_registry_source_revision(uuid, uuid, text)
  TO authenticated, service_role;

--------------------------------------------------------------------------------
-- REGISTRY SOURCE POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read registry sources"
ON public.registry_sources
FOR SELECT TO authenticated
USING (public.can_read_registry_source(source_id));

CREATE POLICY "Creators can create registry sources"
ON public.registry_sources
FOR INSERT TO authenticated
WITH CHECK (creator_id = (SELECT auth.uid() AS uid));

CREATE POLICY "Users can read registry revisions"
ON public.registry_revisions
FOR SELECT TO authenticated
USING (public.can_read_registry_source(source_id));

CREATE POLICY "Users can read registry source access"
ON public.registry_source_access
FOR SELECT TO authenticated
USING (
  user_id = (SELECT auth.uid() AS uid)
  OR EXISTS (
    SELECT 1
    FROM public.registry_sources source
    WHERE source.source_id = registry_source_access.source_id
      AND source.creator_id = (SELECT auth.uid() AS uid)
  )
);

CREATE POLICY "Creators can manage registry source access"
ON public.registry_source_access
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.registry_sources source
    WHERE source.source_id = registry_source_access.source_id
      AND source.creator_id = (SELECT auth.uid() AS uid)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.registry_sources source
    WHERE source.source_id = registry_source_access.source_id
      AND source.creator_id = (SELECT auth.uid() AS uid)
  )
);
