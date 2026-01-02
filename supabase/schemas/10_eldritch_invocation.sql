--------------------------------------------------------------------------------
-- ELDRITCH INVOCATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.eldritch_invocations (
  resource_id uuid NOT NULL,
  min_warlock_level smallint NOT NULL,
  CONSTRAINT eldritch_invocations_pkey PRIMARY KEY (resource_id),
  CONSTRAINT eldritch_invocations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT eldritch_invocations_min_warlock_level_check CHECK (((min_warlock_level >= 0) AND (min_warlock_level <= 20)))
);

ALTER TABLE public.eldritch_invocations OWNER TO postgres;
ALTER TABLE public.eldritch_invocations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.eldritch_invocations TO anon;
GRANT ALL ON TABLE public.eldritch_invocations TO authenticated;
GRANT ALL ON TABLE public.eldritch_invocations TO service_role;


--------------------------------------------------------------------------------
-- ELDRITCH INVOCATION TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.eldritch_invocation_translations (
  resource_id uuid NOT NULL,
  lang text DEFAULT ''::text NOT NULL,
  prerequisite text,
  description text DEFAULT ''::text NOT NULL,
  CONSTRAINT eldritch_invocation_translations_r_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT eldritch_invocation_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.eldritch_invocations(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT eldritch_invocation_translations_r_lang_fkey FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.eldritch_invocation_translations OWNER TO postgres;
ALTER TABLE public.eldritch_invocation_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.eldritch_invocation_translations TO anon;
GRANT ALL ON TABLE public.eldritch_invocation_translations TO authenticated;
GRANT ALL ON TABLE public.eldritch_invocation_translations TO service_role;


--------------------------------------------------------------------------------
-- ELDRITCH INVOCATION RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_eldritch_invocation_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'eldritch_invocation'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not an eldritch invocation', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_eldritch_invocation_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_eldritch_invocation_resource_kind
  BEFORE INSERT OR UPDATE ON public.eldritch_invocations
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_eldritch_invocation_resource_kind();

GRANT ALL ON FUNCTION public.validate_eldritch_invocation_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_eldritch_invocation_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_eldritch_invocation_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- ELDRITCH INVOCATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read eldritch invocations"
ON public.eldritch_invocations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new eldritch invocations"
ON public.eldritch_invocations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update eldritch invocations"
ON public.eldritch_invocations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete eldritch invocations"
ON public.eldritch_invocations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- ELDRITCH INVOCATION TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read eldritch invocation translations"
ON public.eldritch_invocation_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new eldritch invocation translations"
ON public.eldritch_invocation_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update eldritch invocation translations"
ON public.eldritch_invocation_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete eldritch invocation translations"
ON public.eldritch_invocation_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


