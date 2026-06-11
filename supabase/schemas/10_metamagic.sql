--------------------------------------------------------------------------------
-- METAMAGICS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.metamagics (
  resource_id uuid NOT NULL,
  sorcery_points smallint NOT NULL,
  CONSTRAINT metamagics_pkey PRIMARY KEY (resource_id),
  CONSTRAINT metamagics_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT metamagics_sorcery_points_check CHECK (sorcery_points >= 0)
);

ALTER TABLE public.metamagics OWNER TO postgres;
ALTER TABLE public.metamagics ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.metamagics TO anon;
GRANT ALL ON TABLE public.metamagics TO authenticated;
GRANT ALL ON TABLE public.metamagics TO service_role;


--------------------------------------------------------------------------------
-- METAMAGIC TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.metamagic_translations (
  resource_id uuid NOT NULL,
  lang text DEFAULT ''::text NOT NULL,
  prerequisite text DEFAULT ''::text NOT NULL,
  description text DEFAULT ''::text NOT NULL,
  CONSTRAINT metamagic_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT metamagic_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.metamagics(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT metamagic_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.metamagic_translations OWNER TO postgres;
ALTER TABLE public.metamagic_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.metamagic_translations TO anon;
GRANT ALL ON TABLE public.metamagic_translations TO authenticated;
GRANT ALL ON TABLE public.metamagic_translations TO service_role;


--------------------------------------------------------------------------------
-- METAMAGIC RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_metamagic_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'metamagic'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a metamagic option', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_metamagic_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_metamagic_resource_kind
  BEFORE INSERT OR UPDATE ON public.metamagics
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_metamagic_resource_kind();

GRANT ALL ON FUNCTION public.validate_metamagic_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_metamagic_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_metamagic_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- METAMAGICS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read metamagics"
ON public.metamagics
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new metamagics"
ON public.metamagics
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update metamagics"
ON public.metamagics
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete metamagics"
ON public.metamagics
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- METAMAGIC TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read metamagic translations"
ON public.metamagic_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new metamagic translations"
ON public.metamagic_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update metamagic translations"
ON public.metamagic_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete metamagic translations"
ON public.metamagic_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

