--------------------------------------------------------------------------------
-- SPELLS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.spells (
  resource_id uuid NOT NULL,
  level smallint NOT NULL,
  school public.spell_school NOT NULL,
  concentration boolean NOT NULL,
  ritual boolean NOT NULL,
  somatic boolean NOT NULL,
  verbal boolean NOT NULL,
  material boolean NOT NULL,
  casting_time public.spell_casting_time DEFAULT 'action'::public.spell_casting_time NOT NULL,
  casting_time_value integer,
  duration public.spell_duration DEFAULT 'value'::public.spell_duration NOT NULL,
  duration_value integer,
  range public.spell_range DEFAULT 'self'::public.spell_range NOT NULL,
  range_value integer,
  CONSTRAINT spells_pkey PRIMARY KEY (resource_id),
  CONSTRAINT spells_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT spells_casting_time_pair_chk CHECK ((casting_time = 'value'::public.spell_casting_time) = (casting_time_value IS NOT NULL)),
  CONSTRAINT spells_duration_pair_chk CHECK ((duration = 'value'::public.spell_duration) = (duration_value IS NOT NULL)),
  CONSTRAINT spells_level_check CHECK (((level >= 0) AND (level <= 9))),
  CONSTRAINT spells_range_pair_chk CHECK ((range = 'value'::public.spell_range) = (range_value IS NOT NULL))
);

ALTER TABLE public.spells OWNER TO postgres;
ALTER TABLE public.spells ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.spells TO anon;
GRANT ALL ON TABLE public.spells TO authenticated;
GRANT ALL ON TABLE public.spells TO service_role;


--------------------------------------------------------------------------------
-- SPELL TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.spell_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  materials text,
  description text NOT NULL,
  upgrade text,
  CONSTRAINT spell_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT spell_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.spells(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT spell_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.spell_translations OWNER TO postgres;
ALTER TABLE public.spell_translations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_spell_translations_lang ON public.spell_translations USING btree (lang);

GRANT ALL ON TABLE public.spell_translations TO anon;
GRANT ALL ON TABLE public.spell_translations TO authenticated;
GRANT ALL ON TABLE public.spell_translations TO service_role;


--------------------------------------------------------------------------------
-- SPELL RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_spell_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'spell'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a spell', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_spell_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_spell_resource_kind
  BEFORE INSERT OR UPDATE ON public.spells
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_spell_resource_kind();

GRANT ALL ON FUNCTION public.validate_spell_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_spell_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_spell_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- SPELLS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read spells"
ON public.spells
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new spells"
ON public.spells
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update spells"
ON public.spells
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete spells"
ON public.spells
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- SPELL TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read spell translations"
ON public.spell_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new spell translations"
ON public.spell_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update spell translations"
ON public.spell_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete spell translations"
ON public.spell_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));
