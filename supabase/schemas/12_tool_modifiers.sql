--------------------------------------------------------------------------------
-- TOOL MODIFIERS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tool_modifiers (
  resource_id uuid NOT NULL,
  CONSTRAINT tool_modifiers_pkey PRIMARY KEY (resource_id),
  CONSTRAINT tool_modifiers_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.equipment_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.tool_modifiers OWNER TO postgres;
ALTER TABLE public.tool_modifiers ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.tool_modifiers TO anon;
GRANT ALL ON TABLE public.tool_modifiers TO authenticated;
GRANT ALL ON TABLE public.tool_modifiers TO service_role;

CREATE TABLE IF NOT EXISTS public.tool_modifier_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  CONSTRAINT tool_modifier_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT tool_modifier_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.tool_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT tool_modifier_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.tool_modifier_translations OWNER TO postgres;
ALTER TABLE public.tool_modifier_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.tool_modifier_translations TO anon;
GRANT ALL ON TABLE public.tool_modifier_translations TO authenticated;
GRANT ALL ON TABLE public.tool_modifier_translations TO service_role;


--------------------------------------------------------------------------------
-- POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read tool modifiers"
ON public.tool_modifiers
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new tool modifiers"
ON public.tool_modifiers
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update tool modifiers"
ON public.tool_modifiers
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete tool modifiers"
ON public.tool_modifiers
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE POLICY "Users can read tool modifier translations"
ON public.tool_modifier_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new tool modifier translations"
ON public.tool_modifier_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update tool modifier translations"
ON public.tool_modifier_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete tool modifier translations"
ON public.tool_modifier_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));
