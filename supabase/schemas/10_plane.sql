--------------------------------------------------------------------------------
-- PLANES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.planes (
  resource_id uuid NOT NULL,
  category public.plane_category NOT NULL,
  alignments public.creature_alignment[] NOT NULL,
  CONSTRAINT planes_pkey PRIMARY KEY (resource_id),
  CONSTRAINT planes_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.planes OWNER TO postgres;
ALTER TABLE public.planes ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.planes TO anon;
GRANT ALL ON TABLE public.planes TO authenticated;
GRANT ALL ON TABLE public.planes TO service_role;


--------------------------------------------------------------------------------
-- PLANE TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.plane_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  CONSTRAINT plane_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT plane_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.planes(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT plane_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.plane_translations OWNER TO postgres;
ALTER TABLE public.plane_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.plane_translations TO anon;
GRANT ALL ON TABLE public.plane_translations TO authenticated;
GRANT ALL ON TABLE public.plane_translations TO service_role;


--------------------------------------------------------------------------------
-- PLANE RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_plane_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'plane'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a plane', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_plane_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_plane_resource_kind
  BEFORE INSERT OR UPDATE ON public.planes
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_plane_resource_kind();

GRANT ALL ON FUNCTION public.validate_plane_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_plane_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_plane_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- PLANES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read planes"
ON public.planes
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new planes"
ON public.planes
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update planes"
ON public.planes
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete planes"
ON public.planes
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- PLANE TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read plane translations"
ON public.plane_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new plane translations"
ON public.plane_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update plane translations"
ON public.plane_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete plane translations"
ON public.plane_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));
