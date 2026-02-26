--------------------------------------------------------------------------------
-- SOURCES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.sources (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  code text DEFAULT ''::text NOT NULL,
  creator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type public.source_type DEFAULT 'campaign'::public.source_type NOT NULL,
  visibility public.source_visibility DEFAULT 'private'::public.source_visibility NOT NULL,
  CONSTRAINT sources_pkey PRIMARY KEY (id)
);

ALTER TABLE public.sources OWNER TO postgres;

CREATE INDEX idx_sources_creator_id ON public.sources USING btree (creator_id);

ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.sources TO anon;
GRANT ALL ON TABLE public.sources TO authenticated;
GRANT ALL ON TABLE public.sources TO service_role;


--------------------------------------------------------------------------------
-- SOURCE TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.source_translations (
  source_id uuid NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  lang text NOT NULL REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE,
  name text DEFAULT ''::text NOT NULL,
  CONSTRAINT source_translations_pkey PRIMARY KEY (source_id, lang)
);

ALTER TABLE public.source_translations OWNER TO postgres;

ALTER TABLE public.source_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.source_translations TO anon;
GRANT ALL ON TABLE public.source_translations TO authenticated;
GRANT ALL ON TABLE public.source_translations TO service_role;


--------------------------------------------------------------------------------
-- SOURCE INCLUDES (DIRECT DEPENDENCIES)
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.source_includes (
  source_id uuid NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  include_id uuid NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  added_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT source_includes_pkey PRIMARY KEY (source_id, include_id),
  CONSTRAINT source_includes_no_self CHECK (source_id <> include_id)
);

ALTER TABLE public.source_includes OWNER TO postgres;

CREATE INDEX idx_source_includes_source_id ON public.source_includes USING btree (source_id);
CREATE INDEX idx_source_includes_include_id ON public.source_includes USING btree (include_id);

ALTER TABLE public.source_includes ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.source_includes TO anon;
GRANT ALL ON TABLE public.source_includes TO authenticated;
GRANT ALL ON TABLE public.source_includes TO service_role;


--------------------------------------------------------------------------------
-- SOURCE REQUIRES (RECURSIVE DEPENDENCY GRAPH)
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.source_requires (
  source_id uuid NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  required_id uuid NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  added_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT source_requires_pkey PRIMARY KEY (source_id, required_id),
  CONSTRAINT source_requires_no_self CHECK (source_id <> required_id)
);

ALTER TABLE public.source_requires OWNER TO postgres;

CREATE INDEX idx_source_requires_source_id ON public.source_requires USING btree (source_id);
CREATE INDEX idx_source_requires_required_id ON public.source_requires USING btree (required_id);

ALTER TABLE public.source_requires ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.source_requires TO anon;
GRANT ALL ON TABLE public.source_requires TO authenticated;
GRANT ALL ON TABLE public.source_requires TO service_role;


--------------------------------------------------------------------------------
-- SOURCE OWNERSHIPS (GUEST / OWNER)
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.source_ownerships (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  role public.source_ownership NOT NULL,
  acquired_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT source_ownerships_pkey PRIMARY KEY (user_id, source_id)
);

ALTER TABLE public.source_ownerships OWNER TO postgres;

CREATE INDEX idx_source_ownerships_user_id ON public.source_ownerships USING btree (user_id);
CREATE INDEX idx_source_ownerships_source_id ON public.source_ownerships USING btree (source_id);

ALTER TABLE public.source_ownerships ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.source_ownerships TO anon;
GRANT ALL ON TABLE public.source_ownerships TO authenticated;
GRANT ALL ON TABLE public.source_ownerships TO service_role;


--------------------------------------------------------------------------------
-- SOURCE ROLES (EDITOR / ADMIN)
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.source_roles (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  role public.source_role NOT NULL,
  assigned_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT source_roles_pkey PRIMARY KEY (user_id, source_id)
);

ALTER TABLE public.source_roles OWNER TO postgres;

CREATE INDEX idx_source_roles_user_id ON public.source_roles USING btree (user_id);
CREATE INDEX idx_source_roles_source_id ON public.source_roles USING btree (source_id);

ALTER TABLE public.source_roles ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.source_roles TO anon;
GRANT ALL ON TABLE public.source_roles TO authenticated;
GRANT ALL ON TABLE public.source_roles TO service_role;


--------------------------------------------------------------------------------
-- SOURCE ACCESS HELPERS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_read_source(p_source_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.sources s
    WHERE s.id = p_source_id
      AND (
        s.visibility IN ('public'::public.source_visibility, 'purchasable'::public.source_visibility)
        OR s.creator_id = (SELECT auth.uid() AS uid)
        OR EXISTS (
          SELECT 1 FROM public.source_ownerships so
          WHERE so.source_id = s.id
            AND so.user_id = (SELECT auth.uid() AS uid)
        )
        OR EXISTS (
          SELECT 1 FROM public.source_roles sr
          WHERE sr.source_id = s.id
            AND sr.user_id = (SELECT auth.uid() AS uid)
        )
      )
  );
$$;

ALTER FUNCTION public.can_read_source(p_source_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_read_source(p_source_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_read_source(p_source_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_read_source(p_source_id uuid) TO service_role;


CREATE OR REPLACE FUNCTION public.can_admin_source(p_source_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.sources s
    WHERE s.id = p_source_id
      AND (
        s.creator_id = (SELECT auth.uid() AS uid)
        OR EXISTS (
          SELECT 1 FROM public.source_roles sr
          WHERE sr.source_id = s.id
            AND sr.user_id = (SELECT auth.uid() AS uid)
            AND sr.role = 'admin'::public.source_role
        )
      )
  );
$$;

ALTER FUNCTION public.can_admin_source(p_source_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_admin_source(p_source_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_admin_source(p_source_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_admin_source(p_source_id uuid) TO service_role;


CREATE OR REPLACE FUNCTION public.can_edit_source_resources(p_source_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.sources s
    WHERE s.id = p_source_id
      AND (
        s.creator_id = (SELECT auth.uid() AS uid)
        OR EXISTS (
          SELECT 1 FROM public.source_roles sr
          WHERE sr.source_id = s.id
            AND sr.user_id = (SELECT auth.uid() AS uid)
            AND sr.role IN ('admin'::public.source_role, 'editor'::public.source_role)
        )
      )
  );
$$;

ALTER FUNCTION public.can_edit_source_resources(p_source_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_edit_source_resources(p_source_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_edit_source_resources(p_source_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_edit_source_resources(p_source_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- SOURCES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read sources"
ON public.sources
FOR SELECT TO anon, authenticated
USING (public.can_read_source(id));

CREATE POLICY "Authenticated users can create sources"
ON public.sources
FOR INSERT TO authenticated
WITH CHECK (creator_id = (SELECT auth.uid() AS uid));

CREATE POLICY "Admins can update sources"
ON public.sources
FOR UPDATE TO authenticated
USING (public.can_admin_source(id))
WITH CHECK (public.can_admin_source(id));

CREATE POLICY "Admins can delete sources"
ON public.sources
FOR DELETE TO authenticated
USING (public.can_admin_source(id));


--------------------------------------------------------------------------------
-- SOURCE TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read source translations"
ON public.source_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_source(source_id));

CREATE POLICY "Admins can create source translations"
ON public.source_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_admin_source(source_id));

CREATE POLICY "Admins can update source translations"
ON public.source_translations
FOR UPDATE TO authenticated
USING (public.can_admin_source(source_id))
WITH CHECK (public.can_admin_source(source_id));

CREATE POLICY "Admins can delete source translations"
ON public.source_translations
FOR DELETE TO authenticated
USING (public.can_admin_source(source_id));


--------------------------------------------------------------------------------
-- SOURCE INCLUDES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read source includes"
ON public.source_includes
FOR SELECT TO anon, authenticated
USING (
  public.can_read_source(source_id)
  AND public.can_read_source(include_id)
);

CREATE POLICY "Admins can manage source includes"
ON public.source_includes
FOR INSERT TO authenticated
WITH CHECK (
  public.can_admin_source(source_includes.source_id)
  AND (
    EXISTS (
      SELECT 1 FROM public.sources s
      WHERE s.id = source_includes.include_id
        AND s.visibility = 'public'::public.source_visibility
    )
    OR EXISTS (
      SELECT 1 FROM public.source_ownerships so
      WHERE so.source_id = source_includes.include_id
        AND so.user_id = (SELECT auth.uid() AS uid)
        AND so.role = 'owner'::public.source_ownership
    )
  )
);

CREATE POLICY "Admins can remove source includes"
ON public.source_includes
FOR DELETE TO authenticated
USING (
  public.can_admin_source(source_includes.source_id)
);


--------------------------------------------------------------------------------
-- SOURCE REQUIRES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read source requires"
ON public.source_requires
FOR SELECT TO anon, authenticated
USING (
  public.can_read_source(source_id)
  AND public.can_read_source(required_id)
);

CREATE POLICY "Admins can manage source requires"
ON public.source_requires
FOR INSERT TO authenticated
WITH CHECK (
  public.can_admin_source(source_requires.source_id)
  AND (
    EXISTS (
      SELECT 1 FROM public.sources s
      WHERE s.id = source_requires.required_id
        AND s.visibility = 'public'::public.source_visibility
    )
    OR EXISTS (
      SELECT 1 FROM public.source_ownerships so
      WHERE so.source_id = source_requires.required_id
        AND so.user_id = (SELECT auth.uid() AS uid)
        AND so.role = 'owner'::public.source_ownership
    )
  )
);

CREATE POLICY "Admins can remove source requires"
ON public.source_requires
FOR DELETE TO authenticated
USING (public.can_admin_source(source_requires.source_id));


--------------------------------------------------------------------------------
-- SOURCE ROLES & OWNERSHIPS ENFORCEMENT
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ensure_source_creator_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NEW.creator_id IS NOT NULL THEN
    INSERT INTO public.source_ownerships (user_id, source_id, role)
    VALUES (NEW.creator_id, NEW.id, 'owner'::public.source_ownership)
    ON CONFLICT (user_id, source_id) DO UPDATE
    SET role = 'owner'::public.source_ownership;

    INSERT INTO public.source_roles (user_id, source_id, role)
    VALUES (NEW.creator_id, NEW.id, 'admin'::public.source_role)
    ON CONFLICT (user_id, source_id) DO UPDATE
    SET role = 'admin'::public.source_role;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.ensure_source_creator_roles() OWNER TO postgres;

CREATE TRIGGER enforce_source_creator_roles
  AFTER INSERT OR UPDATE OF creator_id ON public.sources
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_source_creator_roles();

GRANT ALL ON FUNCTION public.ensure_source_creator_roles() TO anon;
GRANT ALL ON FUNCTION public.ensure_source_creator_roles() TO authenticated;
GRANT ALL ON FUNCTION public.ensure_source_creator_roles() TO service_role;


--------------------------------------------------------------------------------
-- SOURCE OWNERSHIPS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read source ownerships"
ON public.source_ownerships
FOR SELECT TO authenticated
USING (
  user_id = (SELECT auth.uid() AS uid)
  OR public.can_admin_source(source_id)
);

CREATE POLICY "Admins can manage source ownerships"
ON public.source_ownerships
FOR INSERT TO authenticated
WITH CHECK (public.can_admin_source(source_id));

CREATE POLICY "Admins can update source ownerships"
ON public.source_ownerships
FOR UPDATE TO authenticated
USING (public.can_admin_source(source_id))
WITH CHECK (public.can_admin_source(source_id));

CREATE POLICY "Admins can delete source ownerships"
ON public.source_ownerships
FOR DELETE TO authenticated
USING (public.can_admin_source(source_id));


--------------------------------------------------------------------------------
-- SOURCE ROLES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read source roles"
ON public.source_roles
FOR SELECT TO authenticated
USING (
  user_id = (SELECT auth.uid() AS uid)
  OR public.can_admin_source(source_id)
);

CREATE POLICY "Admins can manage source roles (editor only)"
ON public.source_roles
FOR INSERT TO authenticated
WITH CHECK (
  public.can_admin_source(source_id)
  AND role = 'editor'::public.source_role
);

CREATE POLICY "Creator can assign admin role"
ON public.source_roles
FOR INSERT TO authenticated
WITH CHECK (
  role = 'admin'::public.source_role
  AND EXISTS (
    SELECT 1 FROM public.sources s
    WHERE s.id = source_roles.source_id
      AND s.creator_id = (SELECT auth.uid() AS uid)
  )
);

CREATE POLICY "Admins can update source roles"
ON public.source_roles
FOR UPDATE TO authenticated
USING (public.can_admin_source(source_id))
WITH CHECK (public.can_admin_source(source_id));

CREATE POLICY "Admins can delete source roles"
ON public.source_roles
FOR DELETE TO authenticated
USING (public.can_admin_source(source_id) OR user_id = (SELECT auth.uid() AS uid));

--------------------------------------------------------------------------------
-- SOURCE RESOURCE IDS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.source_ids_with_includes(
  p_source_id uuid,
  p_source_filter jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(id uuid)
LANGUAGE sql STABLE
SET search_path TO 'public', 'pg_temp'
AS $$
  WITH RECURSIVE prefs AS (
    SELECT
      -- include these ids
      (
        SELECT coalesce(array_agg(e.key::uuid), null)
        FROM jsonb_each_text(p_source_filter) AS e(key, value)
        WHERE e.value = 'true'
      ) AS ids_inc,
      -- exclude these ids
      (
        SELECT coalesce(array_agg(e.key::uuid), null)
        FROM jsonb_each_text(p_source_filter) AS e(key, value)
        WHERE e.value = 'false'
      ) AS ids_exc
  ),
  source_tree AS (
    SELECT p_source_id AS id, ARRAY[p_source_id] AS path
    UNION ALL
    SELECT si.include_id, st.path || si.include_id
    FROM public.source_includes si
    JOIN source_tree st ON si.source_id = st.id
    WHERE NOT si.include_id = ANY(st.path)
  ),
  base_ids AS (
    SELECT DISTINCT id FROM source_tree
  )
  SELECT b.id
  FROM base_ids b, prefs p
  WHERE (p.ids_inc IS NULL OR b.id = ANY(p.ids_inc))
    AND (p.ids_exc IS NULL OR NOT (b.id = ANY(p.ids_exc)));
$$;

ALTER FUNCTION public.source_ids_with_includes(p_source_id uuid, p_source_filter jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.source_ids_with_includes(p_source_id uuid, p_source_filter jsonb) TO anon;
GRANT ALL ON FUNCTION public.source_ids_with_includes(p_source_id uuid, p_source_filter jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.source_ids_with_includes(p_source_id uuid, p_source_filter jsonb) TO service_role;


--------------------------------------------------------------------------------
-- SOURCE RESOURCE IDS WITH DEPENDENCIES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.source_ids_with_includes_and_requires(
  p_source_id uuid,
  p_source_filter jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(id uuid)
LANGUAGE sql STABLE
SET search_path TO 'public', 'pg_temp'
AS $$
  WITH RECURSIVE prefs AS (
    SELECT
      -- include these ids
      (
        SELECT coalesce(array_agg(e.key::uuid), null)
        FROM jsonb_each_text(p_source_filter) AS e(key, value)
        WHERE e.value = 'true'
      ) AS ids_inc,
      -- exclude these ids
      (
        SELECT coalesce(array_agg(e.key::uuid), null)
        FROM jsonb_each_text(p_source_filter) AS e(key, value)
        WHERE e.value = 'false'
      ) AS ids_exc
  ),
  include_tree AS (
    SELECT p_source_id AS id, ARRAY[p_source_id] AS path
    UNION ALL
    SELECT si.include_id, it.path || si.include_id
    FROM public.source_includes si
    JOIN include_tree it ON si.source_id = it.id
    WHERE NOT si.include_id = ANY(it.path)
  ),
  base_ids AS (
    SELECT DISTINCT id FROM include_tree
  ),
  source_tree AS (
    SELECT b.id, ARRAY[b.id] AS path
    FROM base_ids b
    UNION ALL
    SELECT sr.required_id, st.path || sr.required_id
    FROM public.source_requires sr
    JOIN source_tree st ON sr.source_id = st.id
    WHERE NOT sr.required_id = ANY(st.path)
  ),
  all_ids AS (
    SELECT DISTINCT id FROM source_tree
  )
  SELECT a.id
  FROM all_ids a, prefs p
  WHERE (p.ids_inc IS NULL OR a.id = ANY(p.ids_inc))
    AND (p.ids_exc IS NULL OR NOT (a.id = ANY(p.ids_exc)));
$$;

ALTER FUNCTION public.source_ids_with_includes_and_requires(p_source_id uuid, p_source_filter jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.source_ids_with_includes_and_requires(p_source_id uuid, p_source_filter jsonb) TO anon;
GRANT ALL ON FUNCTION public.source_ids_with_includes_and_requires(p_source_id uuid, p_source_filter jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.source_ids_with_includes_and_requires(p_source_id uuid, p_source_filter jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH SOURCES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_sources(p_types public.source_type[] DEFAULT NULL)
RETURNS TABLE(id uuid, code text, type public.source_type, name jsonb, includes jsonb)
LANGUAGE sql STABLE
SET search_path TO 'public', 'pg_temp'
AS $$
  WITH names AS (
    SELECT
      st.source_id AS id,
      jsonb_object_agg(st.lang, st.name) AS name
    FROM public.source_translations st
    GROUP BY st.source_id
  ),
  visible AS (
    SELECT
      s.id,
      s.code,
      s.type,
      coalesce(n.name, '{}'::jsonb) AS name
    FROM public.sources s
    LEFT JOIN names n ON n.id = s.id
    WHERE public.can_read_source(s.id)
      AND (p_types IS NULL OR s.type = ANY(p_types))
  )
  SELECT
    v.id,
    v.code,
    v.type,
    v.name,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', d.id,
          'code', ds.code,
          'type', ds.type,
          'name', coalesce(dn.name, '{}'::jsonb)
        )
        ORDER BY ds.code
      ) FILTER (WHERE d.id IS NOT NULL),
      '[]'::jsonb
    ) AS includes
  FROM visible v
  LEFT JOIN LATERAL (
    WITH RECURSIVE tree AS (
      SELECT si.include_id AS id, ARRAY[si.include_id] AS path
      FROM public.source_includes si
      WHERE si.source_id = v.id
      UNION ALL
      SELECT sr.required_id, t.path || sr.required_id
      FROM public.source_requires sr
      JOIN tree t ON sr.source_id = t.id
      WHERE NOT sr.required_id = ANY(t.path)
    )
    SELECT DISTINCT t.id
    FROM tree t
    WHERE public.can_read_source(t.id)
  ) d ON true
  LEFT JOIN public.sources ds ON ds.id = d.id
  LEFT JOIN names dn ON dn.id = d.id
  GROUP BY v.id, v.code, v.type, v.name
  ORDER BY v.code;
$$;

  ALTER FUNCTION public.fetch_sources(p_types public.source_type[]) OWNER TO postgres;

  GRANT ALL ON FUNCTION public.fetch_sources(p_types public.source_type[]) TO anon;
  GRANT ALL ON FUNCTION public.fetch_sources(p_types public.source_type[]) TO authenticated;
  GRANT ALL ON FUNCTION public.fetch_sources(p_types public.source_type[]) TO service_role;
