--------------------------------------------------------------------------------
-- FEATURES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.features (
  resource_id uuid NOT NULL,
  CONSTRAINT features_pkey PRIMARY KEY (resource_id),
  CONSTRAINT features_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.features OWNER TO postgres;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.features TO anon;
GRANT ALL ON TABLE public.features TO authenticated;
GRANT ALL ON TABLE public.features TO service_role;


--------------------------------------------------------------------------------
-- FEATURE TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.feature_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  display_name text DEFAULT ''::text NOT NULL,
  description text DEFAULT ''::text NOT NULL,
  CONSTRAINT feature_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT feature_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.features(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT feature_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.feature_translations OWNER TO postgres;
ALTER TABLE public.feature_translations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_feature_translations_lang ON public.feature_translations USING btree (lang);

GRANT ALL ON TABLE public.feature_translations TO anon;
GRANT ALL ON TABLE public.feature_translations TO authenticated;
GRANT ALL ON TABLE public.feature_translations TO service_role;


--------------------------------------------------------------------------------
-- FEATURE RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_feature_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'feature'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a feature', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_feature_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_feature_resource_kind
  BEFORE INSERT OR UPDATE ON public.features
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_feature_resource_kind();

GRANT ALL ON FUNCTION public.validate_feature_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_feature_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_feature_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- FEATURES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read features"
ON public.features
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new features"
ON public.features
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update features"
ON public.features
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete features"
ON public.features
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- FEATURE TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read feature translations"
ON public.feature_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new feature translations"
ON public.feature_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update feature translations"
ON public.feature_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete feature translations"
ON public.feature_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));
