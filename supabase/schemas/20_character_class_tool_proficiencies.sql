--------------------------------------------------------------------------------
-- CHARACTER CLASS TOOL PROFICIENCIES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.character_class_tool_proficiencies (
  character_class_id uuid NOT NULL,
  tool_id uuid NOT NULL,
  CONSTRAINT character_class_tool_proficiencies_pkey PRIMARY KEY (character_class_id, tool_id),
  CONSTRAINT character_class_tool_proficiencies_character_class_id_fkey FOREIGN KEY (character_class_id) REFERENCES public.character_classes(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT character_class_tool_proficiencies_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES public.tools(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.character_class_tool_proficiencies OWNER TO postgres;
ALTER TABLE public.character_class_tool_proficiencies ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.character_class_tool_proficiencies TO anon;
GRANT ALL ON TABLE public.character_class_tool_proficiencies TO authenticated;
GRANT ALL ON TABLE public.character_class_tool_proficiencies TO service_role;

CREATE INDEX idx_character_class_tool_proficiencies_class_id ON public.character_class_tool_proficiencies USING btree (character_class_id);
CREATE INDEX idx_character_class_tool_proficiencies_tool_id ON public.character_class_tool_proficiencies USING btree (tool_id);


--------------------------------------------------------------------------------
-- CHARACTER CLASS TOOL PROFICIENCIES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read character class tool proficiencies"
ON public.character_class_tool_proficiencies
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(character_class_id) AND public.can_read_resource(tool_id));

CREATE POLICY "Creators and GMs can create character class tool proficiencies"
ON public.character_class_tool_proficiencies
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(character_class_id));

CREATE POLICY "Creators and GMs can delete character class tool proficiencies"
ON public.character_class_tool_proficiencies
FOR DELETE TO authenticated
USING (public.can_edit_resource(character_class_id));
