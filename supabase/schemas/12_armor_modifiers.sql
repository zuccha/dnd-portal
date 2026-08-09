--------------------------------------------------------------------------------
-- ARMOR MODIFIERS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.armor_modifiers (
  resource_id uuid NOT NULL,
  CONSTRAINT armor_modifiers_pkey PRIMARY KEY (resource_id),
  CONSTRAINT armor_modifiers_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.equipment_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.armor_modifiers OWNER TO postgres;
ALTER TABLE public.armor_modifiers ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.armor_modifiers TO anon;
GRANT ALL ON TABLE public.armor_modifiers TO authenticated;
GRANT ALL ON TABLE public.armor_modifiers TO service_role;

CREATE TABLE IF NOT EXISTS public.armor_modifier_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  CONSTRAINT armor_modifier_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT armor_modifier_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.armor_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT armor_modifier_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.armor_modifier_translations OWNER TO postgres;
ALTER TABLE public.armor_modifier_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.armor_modifier_translations TO anon;
GRANT ALL ON TABLE public.armor_modifier_translations TO authenticated;
GRANT ALL ON TABLE public.armor_modifier_translations TO service_role;


--------------------------------------------------------------------------------
-- ARMOR MODIFIER SYNC VERSION TRIGGERS
--------------------------------------------------------------------------------

CREATE TRIGGER bump_armor_modifiers_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.armor_modifiers
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

CREATE TRIGGER bump_armor_modifier_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.armor_modifier_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');


--------------------------------------------------------------------------------
-- POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read armor modifiers"
ON public.armor_modifiers
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new armor modifiers"
ON public.armor_modifiers
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update armor modifiers"
ON public.armor_modifiers
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete armor modifiers"
ON public.armor_modifiers
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE POLICY "Users can read armor modifier translations"
ON public.armor_modifier_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new armor modifier translations"
ON public.armor_modifier_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update armor modifier translations"
ON public.armor_modifier_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete armor modifier translations"
ON public.armor_modifier_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));
