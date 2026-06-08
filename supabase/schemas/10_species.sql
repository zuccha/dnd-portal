--------------------------------------------------------------------------------
-- SPECIES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.species (
  resource_id uuid NOT NULL,
  type public.creature_type NOT NULL,
  sizes public.creature_size[] NOT NULL,
  speed integer NOT NULL,
  CONSTRAINT species_pkey PRIMARY KEY (resource_id),
  CONSTRAINT species_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT species_sizes_check CHECK (array_length(sizes, 1) > 0)
);

ALTER TABLE public.species OWNER TO postgres;
ALTER TABLE public.species ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.species TO anon;
GRANT ALL ON TABLE public.species TO authenticated;
GRANT ALL ON TABLE public.species TO service_role;


--------------------------------------------------------------------------------
-- SPECIES TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.species_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  description text DEFAULT ''::text NOT NULL,
  CONSTRAINT species_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT species_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.species(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT species_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.species_translations OWNER TO postgres;
ALTER TABLE public.species_translations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_species_translations_lang ON public.species_translations USING btree (lang);

GRANT ALL ON TABLE public.species_translations TO anon;
GRANT ALL ON TABLE public.species_translations TO authenticated;
GRANT ALL ON TABLE public.species_translations TO service_role;


--------------------------------------------------------------------------------
-- SPECIES RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_species_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'species'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a species', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_species_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_species_resource_kind
  BEFORE INSERT OR UPDATE ON public.species
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_species_resource_kind();

GRANT ALL ON FUNCTION public.validate_species_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_species_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_species_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- SPECIES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read species"
ON public.species
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new species"
ON public.species
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update species"
ON public.species
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete species"
ON public.species
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- SPECIES TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read species translations"
ON public.species_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new species translations"
ON public.species_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update species translations"
ON public.species_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete species translations"
ON public.species_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));
