--------------------------------------------------------------------------------
-- TOOLS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tools (
  resource_id uuid NOT NULL,
  ability public.creature_ability NOT NULL,
  type public.tool_type NOT NULL,
  CONSTRAINT tools_pkey PRIMARY KEY (resource_id),
  CONSTRAINT tools_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.equipments(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.tools OWNER TO postgres;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.tools TO anon;
GRANT ALL ON TABLE public.tools TO authenticated;
GRANT ALL ON TABLE public.tools TO service_role;


--------------------------------------------------------------------------------
-- TOOL TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tool_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  craft text NOT NULL,
  utilize text NOT NULL,
  CONSTRAINT tool_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT tool_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.tools(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT tool_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.tool_translations OWNER TO postgres;
ALTER TABLE public.tool_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.tool_translations TO anon;
GRANT ALL ON TABLE public.tool_translations TO authenticated;
GRANT ALL ON TABLE public.tool_translations TO service_role;


--------------------------------------------------------------------------------
-- TOOLS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read tools"
ON public.tools
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new tools"
ON public.tools
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update tools"
ON public.tools
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete tools"
ON public.tools
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- TOOL TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read tool translations"
ON public.tool_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new tool translations"
ON public.tool_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update tool translations"
ON public.tool_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete tool translations"
ON public.tool_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

