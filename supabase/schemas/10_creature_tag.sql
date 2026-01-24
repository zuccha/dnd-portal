--------------------------------------------------------------------------------
-- CREATURE TAGS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.creature_tags (
  resource_id uuid NOT NULL,
  CONSTRAINT creature_tags_pkey PRIMARY KEY (resource_id),
  CONSTRAINT creature_tags_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.creature_tags OWNER TO postgres;
ALTER TABLE public.creature_tags ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.creature_tags TO anon;
GRANT ALL ON TABLE public.creature_tags TO authenticated;
GRANT ALL ON TABLE public.creature_tags TO service_role;


--------------------------------------------------------------------------------
-- CREATURE TAG TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.creature_tag_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  CONSTRAINT creature_tag_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT creature_tag_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.creature_tags(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT creature_tag_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.creature_tag_translations OWNER TO postgres;
ALTER TABLE public.creature_tag_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.creature_tag_translations TO anon;
GRANT ALL ON TABLE public.creature_tag_translations TO authenticated;
GRANT ALL ON TABLE public.creature_tag_translations TO service_role;


--------------------------------------------------------------------------------
-- CREATURE TAG RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_creature_tag_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'creature_tag'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a creature tag', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_creature_tag_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_creature_tag_resource_kind
  BEFORE INSERT OR UPDATE ON public.creature_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_creature_tag_resource_kind();

GRANT ALL ON FUNCTION public.validate_creature_tag_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_creature_tag_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_creature_tag_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- CREATURE TAGS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read creature tags"
ON public.creature_tags
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new creature tags"
ON public.creature_tags
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update creature tags"
ON public.creature_tags
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete creature tags"
ON public.creature_tags
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- CREATURE TAG TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read creature tag translations"
ON public.creature_tag_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new creature tag translations"
ON public.creature_tag_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update creature tag translations"
ON public.creature_tag_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete creature tag translations"
ON public.creature_tag_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));
