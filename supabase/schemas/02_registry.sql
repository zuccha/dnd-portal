--------------------------------------------------------------------------------
-- REGISTRY SOURCES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.registry_sources (
  source_id uuid NOT NULL,
  creator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  code text NOT NULL,
  name jsonb NOT NULL,
  type public.source_type NOT NULL,
  version public.source_version NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  current_revision_id uuid,
  current_revision_number bigint DEFAULT 0 NOT NULL,
  CONSTRAINT registry_sources_pkey PRIMARY KEY (source_id),
  CONSTRAINT registry_sources_current_revision_number_check
    CHECK (current_revision_number >= 0)
);

ALTER TABLE public.registry_sources OWNER TO postgres;
ALTER TABLE public.registry_sources ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_registry_sources_creator_id
  ON public.registry_sources USING btree (creator_id);

GRANT SELECT ON TABLE public.registry_sources TO anon;
GRANT SELECT ON TABLE public.registry_sources TO authenticated;
GRANT ALL ON TABLE public.registry_sources TO service_role;


--------------------------------------------------------------------------------
-- REGISTRY REVISIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.registry_revisions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  source_id uuid NOT NULL REFERENCES public.registry_sources(source_id)
    ON DELETE CASCADE,
  revision_number bigint NOT NULL,
  revision_created_at timestamp with time zone DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  storage_path text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT registry_revisions_pkey PRIMARY KEY (id),
  CONSTRAINT registry_revisions_source_number_key
    UNIQUE (source_id, revision_number),
  CONSTRAINT registry_revisions_number_check CHECK (revision_number > 0)
);

ALTER TABLE public.registry_revisions OWNER TO postgres;
ALTER TABLE public.registry_revisions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_registry_revisions_source_id
  ON public.registry_revisions USING btree (source_id);

GRANT SELECT ON TABLE public.registry_revisions TO anon;
GRANT SELECT ON TABLE public.registry_revisions TO authenticated;
GRANT ALL ON TABLE public.registry_revisions TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'registry_sources_current_revision_fkey'
      AND conrelid = 'public.registry_sources'::regclass
  ) THEN
    ALTER TABLE public.registry_sources
      ADD CONSTRAINT registry_sources_current_revision_fkey
      FOREIGN KEY (current_revision_id)
      REFERENCES public.registry_revisions(id);
  END IF;
END;
$$;


--------------------------------------------------------------------------------
-- REGISTRY SOURCE ACCESS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.registry_source_access (
  source_id uuid NOT NULL REFERENCES public.registry_sources(source_id)
    ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access text NOT NULL,
  granted_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT registry_source_access_pkey
    PRIMARY KEY (source_id, user_id),
  CONSTRAINT registry_source_access_access_check
    CHECK (access IN ('read', 'write'))
);

ALTER TABLE public.registry_source_access OWNER TO postgres;
ALTER TABLE public.registry_source_access ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_registry_source_access_user_id
  ON public.registry_source_access USING btree (user_id);

GRANT SELECT ON TABLE public.registry_source_access TO authenticated;
GRANT ALL ON TABLE public.registry_source_access TO service_role;
