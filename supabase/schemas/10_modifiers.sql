--------------------------------------------------------------------------------
-- MODIFIERS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.modifiers (
  resource_id uuid NOT NULL,
  CONSTRAINT modifiers_pkey PRIMARY KEY (resource_id),
  CONSTRAINT modifiers_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.modifiers OWNER TO postgres;
ALTER TABLE public.modifiers ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.modifiers TO anon;
GRANT ALL ON TABLE public.modifiers TO authenticated;
GRANT ALL ON TABLE public.modifiers TO service_role;


--------------------------------------------------------------------------------
-- MODIFIER TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.modifier_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  applies_to text,
  composite_name text DEFAULT '{base}'::text NOT NULL,
  CONSTRAINT modifier_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT modifier_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT modifier_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.modifier_translations OWNER TO postgres;
ALTER TABLE public.modifier_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.modifier_translations TO anon;
GRANT ALL ON TABLE public.modifier_translations TO authenticated;
GRANT ALL ON TABLE public.modifier_translations TO service_role;


--------------------------------------------------------------------------------
-- MODIFIER RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_modifier_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind IN (
        'equipment_modifier'::public.resource_kind,
        'armor_modifier'::public.resource_kind,
        'item_modifier'::public.resource_kind,
        'tool_modifier'::public.resource_kind,
        'weapon_modifier'::public.resource_kind
      )
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a modifier', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_modifier_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_modifier_resource_kind
  BEFORE INSERT OR UPDATE ON public.modifiers
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_modifier_resource_kind();

GRANT ALL ON FUNCTION public.validate_modifier_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_modifier_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_modifier_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read modifiers"
ON public.modifiers
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new modifiers"
ON public.modifiers
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update modifiers"
ON public.modifiers
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete modifiers"
ON public.modifiers
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE POLICY "Users can read modifier translations"
ON public.modifier_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new modifier translations"
ON public.modifier_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update modifier translations"
ON public.modifier_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete modifier translations"
ON public.modifier_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));
