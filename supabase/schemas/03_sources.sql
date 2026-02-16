--------------------------------------------------------------------------------
-- SOURCES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.sources (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  code text DEFAULT ''::text NOT NULL,
  creator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
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
-- SOURCE ROLES VALIDATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_source_role_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_creator uuid;
BEGIN
  SELECT creator_id INTO v_creator
  FROM public.sources s
  WHERE s.id = NEW.source_id;

  -- role can only be assigned to owners
  IF NOT EXISTS (
    SELECT 1 FROM public.source_ownerships so
    WHERE so.source_id = NEW.source_id
      AND so.user_id = NEW.user_id
      AND so.role = 'owner'::public.source_ownership
  ) THEN
    RAISE EXCEPTION 'Role can only be assigned to owners';
  END IF;

  -- admin role can only be assigned by the creator
  IF NEW.role = 'admin'::public.source_role
     AND v_creator IS NOT NULL
     AND v_creator <> (SELECT auth.uid() AS uid) THEN
    RAISE EXCEPTION 'Only the creator can assign admin role';
  END IF;

  -- editor role can only be assigned by admins
  IF NEW.role = 'editor'::public.source_role
     AND NOT public.can_admin_source(NEW.source_id) THEN
    RAISE EXCEPTION 'Only admins can assign editor role';
  END IF;

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_source_role_write() OWNER TO postgres;

CREATE TRIGGER validate_source_role_write
  BEFORE INSERT OR UPDATE ON public.source_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_source_role_write();

GRANT ALL ON FUNCTION public.validate_source_role_write() TO anon;
GRANT ALL ON FUNCTION public.validate_source_role_write() TO authenticated;
GRANT ALL ON FUNCTION public.validate_source_role_write() TO service_role;


CREATE OR REPLACE FUNCTION public.validate_source_role_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_creator uuid;
  v_uid uuid;
BEGIN
  SELECT creator_id INTO v_creator
  FROM public.sources s
  WHERE s.id = OLD.source_id;

  v_uid := (SELECT auth.uid() AS uid);

  -- creator cannot remove their own role
  IF v_creator IS NOT NULL AND OLD.user_id = v_creator THEN
    RAISE EXCEPTION 'Creator role cannot be removed';
  END IF;

  -- admin role: only creator can revoke others; self-revoke allowed
  IF OLD.role = 'admin'::public.source_role
     AND v_creator IS NOT NULL
     AND v_uid <> v_creator
     AND v_uid <> OLD.user_id THEN
    RAISE EXCEPTION 'Only creator can revoke admin role from others';
  END IF;

  -- editor role: admins can revoke others; self-revoke allowed
  IF OLD.role = 'editor'::public.source_role
     AND v_uid <> OLD.user_id
     AND NOT public.can_admin_source(OLD.source_id) THEN
    RAISE EXCEPTION 'Only admins can revoke editor roles';
  END IF;

  -- fallback: must be creator or self
  IF v_uid <> OLD.user_id AND v_uid <> v_creator THEN
    RAISE EXCEPTION 'Not allowed to revoke this role';
  END IF;

  RETURN OLD;
END;
$$;

ALTER FUNCTION public.validate_source_role_delete() OWNER TO postgres;

CREATE TRIGGER validate_source_role_delete
  BEFORE DELETE ON public.source_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_source_role_delete();

GRANT ALL ON FUNCTION public.validate_source_role_delete() TO anon;
GRANT ALL ON FUNCTION public.validate_source_role_delete() TO authenticated;
GRANT ALL ON FUNCTION public.validate_source_role_delete() TO service_role;


--------------------------------------------------------------------------------
-- SOURCE OWNERSHIPS VALIDATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_source_ownership_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- only admins can grant ownership or guest
  IF NOT public.can_admin_source(NEW.source_id) THEN
    RAISE EXCEPTION 'Only admins can manage ownerships';
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_source_ownership_write() OWNER TO postgres;

CREATE TRIGGER validate_source_ownership_write
  BEFORE INSERT ON public.source_ownerships
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_source_ownership_write();

GRANT ALL ON FUNCTION public.validate_source_ownership_write() TO anon;
GRANT ALL ON FUNCTION public.validate_source_ownership_write() TO authenticated;
GRANT ALL ON FUNCTION public.validate_source_ownership_write() TO service_role;


CREATE OR REPLACE FUNCTION public.validate_source_ownership_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF OLD.role = 'owner'::public.source_ownership THEN
    RAISE EXCEPTION 'Ownership cannot be revoked';
  END IF;

  IF NOT public.can_admin_source(OLD.source_id)
     AND OLD.user_id <> (SELECT auth.uid() AS uid) THEN
    RAISE EXCEPTION 'Only admins or the guest can revoke guests';
  END IF;

  RETURN OLD;
END;
$$;

ALTER FUNCTION public.validate_source_ownership_delete() OWNER TO postgres;

CREATE TRIGGER validate_source_ownership_delete
  BEFORE DELETE ON public.source_ownerships
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_source_ownership_delete();

GRANT ALL ON FUNCTION public.validate_source_ownership_delete() TO anon;
GRANT ALL ON FUNCTION public.validate_source_ownership_delete() TO authenticated;
GRANT ALL ON FUNCTION public.validate_source_ownership_delete() TO service_role;


CREATE OR REPLACE FUNCTION public.validate_source_ownership_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- only allow guest -> owner upgrade
  IF OLD.role = 'guest'::public.source_ownership
     AND NEW.role = 'owner'::public.source_ownership
     AND public.can_admin_source(NEW.source_id) THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Ownership role can only be upgraded from guest to owner';
END;
$$;

ALTER FUNCTION public.validate_source_ownership_update() OWNER TO postgres;

CREATE TRIGGER validate_source_ownership_update
  BEFORE UPDATE ON public.source_ownerships
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_source_ownership_update();

GRANT ALL ON FUNCTION public.validate_source_ownership_update() TO anon;
GRANT ALL ON FUNCTION public.validate_source_ownership_update() TO authenticated;
GRANT ALL ON FUNCTION public.validate_source_ownership_update() TO service_role;


--------------------------------------------------------------------------------
-- SOURCE CREATOR TRANSFER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_source_creator_transfer()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_uid uuid;
BEGIN
  IF NEW.creator_id IS NULL THEN
    RAISE EXCEPTION 'Creator cannot be null';
  END IF;

  v_uid := (SELECT auth.uid() AS uid);

  -- only current creator can transfer
  IF OLD.creator_id IS NOT NULL AND v_uid <> OLD.creator_id THEN
    RAISE EXCEPTION 'Only creator can transfer ownership';
  END IF;

  -- new creator must already be admin
  IF NOT EXISTS (
    SELECT 1 FROM public.source_roles sr
    WHERE sr.source_id = NEW.id
      AND sr.user_id = NEW.creator_id
      AND sr.role = 'admin'::public.source_role
  ) THEN
    RAISE EXCEPTION 'New creator must be an admin';
  END IF;

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_source_creator_transfer() OWNER TO postgres;

CREATE TRIGGER validate_source_creator_transfer
  BEFORE UPDATE OF creator_id ON public.sources
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_source_creator_transfer();

GRANT ALL ON FUNCTION public.validate_source_creator_transfer() TO anon;
GRANT ALL ON FUNCTION public.validate_source_creator_transfer() TO authenticated;
GRANT ALL ON FUNCTION public.validate_source_creator_transfer() TO service_role;
