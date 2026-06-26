--------------------------------------------------------------------------------
-- ITEM MODIFIERS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.item_modifiers (
  resource_id uuid NOT NULL,
  CONSTRAINT item_modifiers_pkey PRIMARY KEY (resource_id),
  CONSTRAINT item_modifiers_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.equipment_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.item_modifiers OWNER TO postgres;
ALTER TABLE public.item_modifiers ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.item_modifiers TO anon;
GRANT ALL ON TABLE public.item_modifiers TO authenticated;
GRANT ALL ON TABLE public.item_modifiers TO service_role;

CREATE TABLE IF NOT EXISTS public.item_modifier_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  CONSTRAINT item_modifier_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT item_modifier_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.item_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT item_modifier_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.item_modifier_translations OWNER TO postgres;
ALTER TABLE public.item_modifier_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.item_modifier_translations TO anon;
GRANT ALL ON TABLE public.item_modifier_translations TO authenticated;
GRANT ALL ON TABLE public.item_modifier_translations TO service_role;


--------------------------------------------------------------------------------
-- POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read item modifiers"
ON public.item_modifiers
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new item modifiers"
ON public.item_modifiers
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update item modifiers"
ON public.item_modifiers
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete item modifiers"
ON public.item_modifiers
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE POLICY "Users can read item modifier translations"
ON public.item_modifier_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new item modifier translations"
ON public.item_modifier_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update item modifier translations"
ON public.item_modifier_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete item modifier translations"
ON public.item_modifier_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));
