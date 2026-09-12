--------------------------------------------------------------------------------
-- REGISTRY SOURCE TYPES
--------------------------------------------------------------------------------

DO $$
BEGIN
  CREATE TYPE public.source_type AS ENUM (
    'core',
    'module',
    'campaign'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

ALTER TYPE public.source_type OWNER TO postgres;

DO $$
BEGIN
  CREATE TYPE public.source_version AS ENUM (
    'dnd5_0',
    'dnd5_5'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

ALTER TYPE public.source_version OWNER TO postgres;


--------------------------------------------------------------------------------
-- REGISTRY SOURCES
--------------------------------------------------------------------------------

CREATE TABLE public.registry_sources (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  source_id uuid NOT NULL,
  creator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  code text NOT NULL,
  name jsonb NOT NULL,
  type public.source_type NOT NULL,
  version public.source_version NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  current_revision_id uuid,
  current_revision_number bigint DEFAULT 0 NOT NULL,
  CONSTRAINT registry_sources_pkey PRIMARY KEY (id),
  CONSTRAINT registry_sources_source_id_key UNIQUE (source_id),
  CONSTRAINT registry_sources_current_revision_number_check
    CHECK (current_revision_number >= 0)
);

ALTER TABLE public.registry_sources OWNER TO postgres;
ALTER TABLE public.registry_sources ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_registry_sources_creator_id
  ON public.registry_sources USING btree (creator_id);

GRANT SELECT ON TABLE public.registry_sources TO anon;
GRANT SELECT ON TABLE public.registry_sources TO authenticated;
GRANT ALL ON TABLE public.registry_sources TO service_role;


--------------------------------------------------------------------------------
-- REGISTRY REVISIONS
--------------------------------------------------------------------------------

CREATE TABLE public.registry_revisions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  registry_source_id uuid NOT NULL REFERENCES public.registry_sources(id)
    ON DELETE CASCADE,
  revision_number bigint NOT NULL,
  revision_created_at timestamp with time zone DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  storage_path text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT registry_revisions_pkey PRIMARY KEY (id),
  CONSTRAINT registry_revisions_source_number_key
    UNIQUE (registry_source_id, revision_number),
  CONSTRAINT registry_revisions_number_check CHECK (revision_number > 0)
);

ALTER TABLE public.registry_revisions OWNER TO postgres;
ALTER TABLE public.registry_revisions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_registry_revisions_source_id
  ON public.registry_revisions USING btree (registry_source_id);

GRANT SELECT ON TABLE public.registry_revisions TO anon;
GRANT SELECT ON TABLE public.registry_revisions TO authenticated;
GRANT ALL ON TABLE public.registry_revisions TO service_role;

ALTER TABLE public.registry_sources
  ADD CONSTRAINT registry_sources_current_revision_fkey
  FOREIGN KEY (current_revision_id)
  REFERENCES public.registry_revisions(id);


--------------------------------------------------------------------------------
-- REGISTRY SOURCE ACCESS
--------------------------------------------------------------------------------

CREATE TABLE public.registry_source_access (
  registry_source_id uuid NOT NULL REFERENCES public.registry_sources(id)
    ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access text NOT NULL,
  granted_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT registry_source_access_pkey
    PRIMARY KEY (registry_source_id, user_id),
  CONSTRAINT registry_source_access_access_check
    CHECK (access IN ('read', 'write'))
);

ALTER TABLE public.registry_source_access OWNER TO postgres;
ALTER TABLE public.registry_source_access ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_registry_source_access_user_id
  ON public.registry_source_access USING btree (user_id);

GRANT SELECT ON TABLE public.registry_source_access TO authenticated;
GRANT ALL ON TABLE public.registry_source_access TO service_role;


--------------------------------------------------------------------------------
-- REGISTRY SOURCE ACCESS HELPERS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_read_registry_source(
  p_registry_source_id uuid
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.registry_sources rs
    WHERE rs.id = p_registry_source_id
      AND (
        rs.creator_id = (SELECT auth.uid() AS uid)
        OR EXISTS (
          SELECT 1
          FROM public.registry_source_access rsa
          WHERE rsa.registry_source_id = rs.id
            AND rsa.user_id = (SELECT auth.uid() AS uid)
            AND rsa.access IN ('read', 'write')
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

CREATE OR REPLACE FUNCTION public.can_write_registry_source(
  p_registry_source_id uuid
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.registry_sources rs
    WHERE rs.id = p_registry_source_id
      AND (
        rs.creator_id = (SELECT auth.uid() AS uid)
        OR EXISTS (
          SELECT 1
          FROM public.registry_source_access rsa
          WHERE rsa.registry_source_id = rs.id
            AND rsa.user_id = (SELECT auth.uid() AS uid)
            AND rsa.access = 'write'
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

CREATE OR REPLACE FUNCTION public.publish_registry_source_revision(
  p_registry_source_id uuid,
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
  v_source public.registry_sources%ROWTYPE;
  v_revision public.registry_revisions%ROWTYPE;
BEGIN
  IF NOT public.can_write_registry_source(p_registry_source_id) THEN
    RAISE EXCEPTION 'User cannot publish this registry source'
      USING ERRCODE = '42501';
  END IF;

  IF p_storage_path IS NULL
     OR p_storage_path NOT LIKE p_registry_source_id::text || '/%' THEN
    RAISE EXCEPTION 'Invalid registry bundle storage path'
      USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_source
  FROM public.registry_sources
  WHERE id = p_registry_source_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registry source not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_source.current_revision_id IS DISTINCT FROM p_base_revision_id THEN
    RAISE EXCEPTION 'Registry source has changed since the submitted revision'
      USING ERRCODE = '40001';
  END IF;

  INSERT INTO public.registry_revisions (
    registry_source_id,
    revision_number,
    created_by,
    storage_path
  )
  VALUES (
    v_source.id,
    v_source.current_revision_number + 1,
    (SELECT auth.uid() AS uid),
    p_storage_path
  )
  RETURNING * INTO v_revision;

  UPDATE public.registry_sources
  SET current_revision_id = v_revision.id,
      current_revision_number = v_revision.revision_number
  WHERE id = v_source.id;

  RETURN QUERY
  SELECT v_revision.id,
         v_revision.revision_number,
         v_revision.revision_created_at;
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
USING (public.can_read_registry_source(id));

CREATE POLICY "Creators can create registry sources"
ON public.registry_sources
FOR INSERT TO authenticated
WITH CHECK (creator_id = (SELECT auth.uid() AS uid));

CREATE POLICY "Users can read registry revisions"
ON public.registry_revisions
FOR SELECT TO authenticated
USING (public.can_read_registry_source(registry_source_id));

CREATE POLICY "Users can read registry source access"
ON public.registry_source_access
FOR SELECT TO authenticated
USING (
  user_id = (SELECT auth.uid() AS uid)
  OR EXISTS (
    SELECT 1
    FROM public.registry_sources rs
    WHERE rs.id = registry_source_access.registry_source_id
      AND rs.creator_id = (SELECT auth.uid() AS uid)
  )
);

CREATE POLICY "Creators can manage registry source access"
ON public.registry_source_access
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.registry_sources rs
    WHERE rs.id = registry_source_access.registry_source_id
      AND rs.creator_id = (SELECT auth.uid() AS uid)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.registry_sources rs
    WHERE rs.id = registry_source_access.registry_source_id
      AND rs.creator_id = (SELECT auth.uid() AS uid)
  )
);
