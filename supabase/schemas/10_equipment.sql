--------------------------------------------------------------------------------
-- EQUIPMENT
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.equipments (
  resource_id uuid NOT NULL,
  cost integer DEFAULT '0'::integer NOT NULL,
  magic boolean DEFAULT 'false'::boolean NOT NULL,
  rarity public.equipment_rarity DEFAULT 'common'::public.equipment_rarity NOT NULL,
  weight integer DEFAULT '0'::integer NOT NULL,
  CONSTRAINT equipments_pkey PRIMARY KEY (resource_id),
  CONSTRAINT equipments_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.equipments OWNER TO postgres;
ALTER TABLE public.equipments ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.equipments TO anon;
GRANT ALL ON TABLE public.equipments TO authenticated;
GRANT ALL ON TABLE public.equipments TO service_role;


--------------------------------------------------------------------------------
-- EQUIPMENT TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.equipment_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  notes text,
  CONSTRAINT equipment_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT equipment_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.equipments(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT equipment_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.equipment_translations OWNER TO postgres;
ALTER TABLE public.equipment_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.equipment_translations TO anon;
GRANT ALL ON TABLE public.equipment_translations TO authenticated;
GRANT ALL ON TABLE public.equipment_translations TO service_role;


--------------------------------------------------------------------------------
-- EQUIPMENT RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_equipment_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = any(ARRAY[
        'equipment'::public.resource_kind,
        'armor'::public.resource_kind,
        'weapon'::public.resource_kind,
        'tool'::public.resource_kind,
        'item'::public.resource_kind
      ])
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not an equipment', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_equipment_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_equipment_resource_kind
  BEFORE INSERT OR UPDATE ON public.equipments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_equipment_resource_kind();

GRANT ALL ON FUNCTION public.validate_equipment_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_equipment_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_equipment_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- EQUIPMENTS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read equipments"
ON public.equipments
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new equipments"
ON public.equipments
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update equipments"
ON public.equipments
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete equipments"
ON public.equipments
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- EQUIPMENT TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read equipment translations"
ON public.equipment_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new equipment translations"
ON public.equipment_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update equipment translations"
ON public.equipment_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete equipment translations"
ON public.equipment_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));
