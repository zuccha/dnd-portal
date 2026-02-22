--------------------------------------------------------------------------------
-- CHARACTER SUBCLASSES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.character_subclasses (
  resource_id uuid NOT NULL,
  character_class_id uuid NOT NULL,
  CONSTRAINT character_subclasses_pkey PRIMARY KEY (resource_id),
  CONSTRAINT character_subclasses_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT character_subclasses_character_class_id_fkey FOREIGN KEY (character_class_id) REFERENCES public.character_classes(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.character_subclasses OWNER TO postgres;
ALTER TABLE public.character_subclasses ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.character_subclasses TO anon;
GRANT ALL ON TABLE public.character_subclasses TO authenticated;
GRANT ALL ON TABLE public.character_subclasses TO service_role;


--------------------------------------------------------------------------------
-- CHARACTER SUBCLASS TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.character_subclass_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  CONSTRAINT character_subclass_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT character_subclass_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.character_subclasses(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT character_subclass_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.character_subclass_translations OWNER TO postgres;
ALTER TABLE public.character_subclass_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.character_subclass_translations TO anon;
GRANT ALL ON TABLE public.character_subclass_translations TO authenticated;
GRANT ALL ON TABLE public.character_subclass_translations TO service_role;


--------------------------------------------------------------------------------
-- CHARACTER SUBCLASS RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_character_subclass_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'character_subclass'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a character subclass', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_character_subclass_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_character_subclass_resource_kind
  BEFORE INSERT OR UPDATE ON public.character_subclasses
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_character_subclass_resource_kind();

GRANT ALL ON FUNCTION public.validate_character_subclass_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_character_subclass_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_character_subclass_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- CHARACTER SUBCLASSES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read character subclasses"
ON public.character_subclasses
FOR SELECT TO anon, authenticated
USING (
  public.can_read_resource(resource_id)
  AND public.can_read_resource(character_class_id)
);

CREATE POLICY "Creators and GMs can create new character subclasses"
ON public.character_subclasses
FOR INSERT TO authenticated
WITH CHECK (
  public.can_edit_resource(resource_id)
  AND public.can_read_resource(character_class_id)
);

CREATE POLICY "Creators and GMs can update character subclasses"
ON public.character_subclasses
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (
  public.can_edit_resource(resource_id)
  AND public.can_read_resource(character_class_id)
);

CREATE POLICY "Creators and GMs can delete character subclasses"
ON public.character_subclasses
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- CHARACTER SUBCLASS TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read character subclass translations"
ON public.character_subclass_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new character subclass translations"
ON public.character_subclass_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update character subclass translations"
ON public.character_subclass_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete character subclass translations"
ON public.character_subclass_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));
