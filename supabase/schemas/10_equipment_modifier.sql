--------------------------------------------------------------------------------
-- EQUIPMENT MODIFIERS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.equipment_modifiers (
  resource_id uuid NOT NULL,
  cost_delta integer DEFAULT '0'::integer NOT NULL,
  make_magic boolean DEFAULT 'false'::boolean NOT NULL,
  rarity_minimum public.equipment_rarity NOT NULL,
  required_attunement_slots_minimum smallint DEFAULT '0'::smallint NOT NULL,
  weight_delta integer DEFAULT '0'::integer NOT NULL,
  CONSTRAINT equipment_modifiers_required_attunement_slots_minimum_check CHECK (required_attunement_slots_minimum >= 0),
  CONSTRAINT equipment_modifiers_pkey PRIMARY KEY (resource_id),
  CONSTRAINT equipment_modifiers_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.equipment_modifiers OWNER TO postgres;
ALTER TABLE public.equipment_modifiers ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.equipment_modifiers TO anon;
GRANT ALL ON TABLE public.equipment_modifiers TO authenticated;
GRANT ALL ON TABLE public.equipment_modifiers TO service_role;


--------------------------------------------------------------------------------
-- EQUIPMENT MODIFIER TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.equipment_modifier_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  applies_to text,
  attunement_notes_delta text,
  composite_name text DEFAULT '{base}'::text NOT NULL,
  notes_delta text,
  CONSTRAINT equipment_modifier_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT equipment_modifier_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.equipment_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT equipment_modifier_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.equipment_modifier_translations OWNER TO postgres;
ALTER TABLE public.equipment_modifier_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.equipment_modifier_translations TO anon;
GRANT ALL ON TABLE public.equipment_modifier_translations TO authenticated;
GRANT ALL ON TABLE public.equipment_modifier_translations TO service_role;


--------------------------------------------------------------------------------
-- EQUIPMENT MODIFIER RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_equipment_modifier_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'equipment_modifier'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not an equipment modifier', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_equipment_modifier_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_equipment_modifier_resource_kind
  BEFORE INSERT OR UPDATE ON public.equipment_modifiers
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_equipment_modifier_resource_kind();

GRANT ALL ON FUNCTION public.validate_equipment_modifier_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_equipment_modifier_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_equipment_modifier_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- EQUIPMENT MODIFIERS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read equipment modifiers"
ON public.equipment_modifiers
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new equipment modifiers"
ON public.equipment_modifiers
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update equipment modifiers"
ON public.equipment_modifiers
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete equipment modifiers"
ON public.equipment_modifiers
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- EQUIPMENT MODIFIER TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read equipment modifier translations"
ON public.equipment_modifier_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new equipment modifier translations"
ON public.equipment_modifier_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update equipment modifier translations"
ON public.equipment_modifier_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete equipment modifier translations"
ON public.equipment_modifier_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));
