--------------------------------------------------------------------------------
-- WEAPON MODIFIERS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.weapon_modifiers (
  resource_id uuid NOT NULL,
  CONSTRAINT weapon_modifiers_pkey PRIMARY KEY (resource_id),
  CONSTRAINT weapon_modifiers_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.equipment_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.weapon_modifiers OWNER TO postgres;
ALTER TABLE public.weapon_modifiers ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.weapon_modifiers TO anon;
GRANT ALL ON TABLE public.weapon_modifiers TO authenticated;
GRANT ALL ON TABLE public.weapon_modifiers TO service_role;

CREATE TABLE IF NOT EXISTS public.weapon_modifier_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  CONSTRAINT weapon_modifier_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT weapon_modifier_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.weapon_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT weapon_modifier_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.weapon_modifier_translations OWNER TO postgres;
ALTER TABLE public.weapon_modifier_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.weapon_modifier_translations TO anon;
GRANT ALL ON TABLE public.weapon_modifier_translations TO authenticated;
GRANT ALL ON TABLE public.weapon_modifier_translations TO service_role;


--------------------------------------------------------------------------------
-- POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read weapon modifiers"
ON public.weapon_modifiers
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new weapon modifiers"
ON public.weapon_modifiers
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update weapon modifiers"
ON public.weapon_modifiers
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete weapon modifiers"
ON public.weapon_modifiers
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE POLICY "Users can read weapon modifier translations"
ON public.weapon_modifier_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new weapon modifier translations"
ON public.weapon_modifier_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update weapon modifier translations"
ON public.weapon_modifier_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete weapon modifier translations"
ON public.weapon_modifier_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));
