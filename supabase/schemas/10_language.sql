--------------------------------------------------------------------------------
-- LANGUAGES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.languages (
  resource_id uuid NOT NULL,
  rarity public.language_rarity NOT NULL,
  CONSTRAINT languages_pkey PRIMARY KEY (resource_id),
  CONSTRAINT languages_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.languages OWNER TO postgres;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.languages TO anon;
GRANT ALL ON TABLE public.languages TO authenticated;
GRANT ALL ON TABLE public.languages TO service_role;


--------------------------------------------------------------------------------
-- LANGUAGE TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.language_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  origin text,
  CONSTRAINT language_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT language_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.languages(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT language_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.language_translations OWNER TO postgres;
ALTER TABLE public.language_translations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_language_translations_lang ON public.language_translations USING btree (lang);

GRANT ALL ON TABLE public.language_translations TO anon;
GRANT ALL ON TABLE public.language_translations TO authenticated;
GRANT ALL ON TABLE public.language_translations TO service_role;


--------------------------------------------------------------------------------
-- LANGUAGE RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_language_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'language'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a language', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_language_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_language_resource_kind
  BEFORE INSERT OR UPDATE ON public.languages
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_language_resource_kind();

GRANT ALL ON FUNCTION public.validate_language_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_language_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_language_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- LANGUAGES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read languages"
ON public.languages
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new languages"
ON public.languages
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update languages"
ON public.languages
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete languages"
ON public.languages
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- LANGUAGE TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read language translations"
ON public.language_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new language translations"
ON public.language_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update language translations"
ON public.language_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete language translations"
ON public.language_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));
