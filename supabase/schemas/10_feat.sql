--------------------------------------------------------------------------------
-- FEATS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.feats (
  resource_id uuid NOT NULL,
  category public.feat_category NOT NULL,
  min_level smallint NOT NULL,
  CONSTRAINT feats_pkey PRIMARY KEY (resource_id),
  CONSTRAINT feats_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT feats_min_level_check CHECK (((min_level >= 0) AND (min_level <= 20)))
);

ALTER TABLE public.feats OWNER TO postgres;
ALTER TABLE public.feats ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.feats TO anon;
GRANT ALL ON TABLE public.feats TO authenticated;
GRANT ALL ON TABLE public.feats TO service_role;


--------------------------------------------------------------------------------
-- FEAT TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.feat_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  prerequisite text DEFAULT ''::text NOT NULL,
  description text DEFAULT ''::text NOT NULL,
  CONSTRAINT feat_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT feat_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.feats(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT feat_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.feat_translations OWNER TO postgres;
ALTER TABLE public.feat_translations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_feat_translations_lang ON public.feat_translations USING btree (lang);

GRANT ALL ON TABLE public.feat_translations TO anon;
GRANT ALL ON TABLE public.feat_translations TO authenticated;
GRANT ALL ON TABLE public.feat_translations TO service_role;


--------------------------------------------------------------------------------
-- FEAT RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_feat_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'feat'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a feat', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_feat_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_feat_resource_kind
  BEFORE INSERT OR UPDATE ON public.feats
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_feat_resource_kind();

GRANT ALL ON FUNCTION public.validate_feat_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_feat_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_feat_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- FEATS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read feats"
ON public.feats
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new feats"
ON public.feats
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update feats"
ON public.feats
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete feats"
ON public.feats
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- FEAT TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read feat translations"
ON public.feat_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new feat translations"
ON public.feat_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update feat translations"
ON public.feat_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete feat translations"
ON public.feat_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));
