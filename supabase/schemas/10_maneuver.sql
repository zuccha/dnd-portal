--------------------------------------------------------------------------------
-- MANEUVERS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.maneuvers (
  resource_id uuid NOT NULL,
  CONSTRAINT maneuvers_pkey PRIMARY KEY (resource_id),
  CONSTRAINT maneuvers_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.maneuvers OWNER TO postgres;
ALTER TABLE public.maneuvers ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.maneuvers TO anon;
GRANT ALL ON TABLE public.maneuvers TO authenticated;
GRANT ALL ON TABLE public.maneuvers TO service_role;


--------------------------------------------------------------------------------
-- MANEUVER TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.maneuver_translations (
  resource_id uuid NOT NULL,
  lang text DEFAULT ''::text NOT NULL,
  prerequisite text DEFAULT ''::text NOT NULL,
  description text DEFAULT ''::text NOT NULL,
  CONSTRAINT maneuver_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT maneuver_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.maneuvers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT maneuver_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.maneuver_translations OWNER TO postgres;
ALTER TABLE public.maneuver_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.maneuver_translations TO anon;
GRANT ALL ON TABLE public.maneuver_translations TO authenticated;
GRANT ALL ON TABLE public.maneuver_translations TO service_role;


--------------------------------------------------------------------------------
-- MANEUVER RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_maneuver_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'maneuver'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a maneuver', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_maneuver_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_maneuver_resource_kind
  BEFORE INSERT OR UPDATE ON public.maneuvers
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_maneuver_resource_kind();

GRANT ALL ON FUNCTION public.validate_maneuver_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_maneuver_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_maneuver_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- MANEUVERS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read maneuvers"
ON public.maneuvers
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new maneuvers"
ON public.maneuvers
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update maneuvers"
ON public.maneuvers
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete maneuvers"
ON public.maneuvers
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- MANEUVER TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read maneuver translations"
ON public.maneuver_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new maneuver translations"
ON public.maneuver_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update maneuver translations"
ON public.maneuver_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete maneuver translations"
ON public.maneuver_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

