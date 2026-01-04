--------------------------------------------------------------------------------
-- CHARACTER CLASSES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.character_classes (
  resource_id uuid NOT NULL,
  armor_proficiencies public.armor_type[] NOT NULL,
  hp_die public.die_type NOT NULL,
  primary_abilities public.creature_ability[] NOT NULL,
  saving_throw_proficiencies public.creature_ability[] NOT NULL,
  skill_proficiencies_pool public.creature_skill[] NOT NULL,
  skill_proficiencies_pool_quantity smallint NOT NULL,
  weapon_proficiencies public.weapon_type[] NOT NULL,
  CONSTRAINT character_classes_pkey PRIMARY KEY (resource_id),
  CONSTRAINT character_classes_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.character_classes OWNER TO postgres;
ALTER TABLE public.character_classes ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.character_classes TO anon;
GRANT ALL ON TABLE public.character_classes TO authenticated;
GRANT ALL ON TABLE public.character_classes TO service_role;


--------------------------------------------------------------------------------
-- CHARACTER CLASS TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.character_class_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  armor_proficiencies_extra text,
  weapon_proficiencies_extra text,
  CONSTRAINT character_class_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT character_class_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.character_classes(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT character_class_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.character_class_translations OWNER TO postgres;
ALTER TABLE public.character_class_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.character_class_translations TO anon;
GRANT ALL ON TABLE public.character_class_translations TO authenticated;
GRANT ALL ON TABLE public.character_class_translations TO service_role;

--------------------------------------------------------------------------------
-- CHARACTER CLASS RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_character_class_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'character_class'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a character class', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_character_class_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_character_class_resource_kind
  BEFORE INSERT OR UPDATE ON public.character_classes
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_character_class_resource_kind();

GRANT ALL ON FUNCTION public.validate_character_class_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_character_class_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_character_class_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- CHARACTER CLASSES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read character classes"
ON public.character_classes
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new character classes"
ON public.character_classes
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update character classes"
ON public.character_classes
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete character classes"
ON public.character_classes
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- CHARACTER CLASS TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read character class translations"
ON public.character_class_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new character class translations"
ON public.character_class_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update character class translations"
ON public.character_class_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete character class translations"
ON public.character_class_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));
