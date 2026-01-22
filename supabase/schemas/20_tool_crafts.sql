--------------------------------------------------------------------------------
-- TOOL CRAFTS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tool_crafts (
  tool_id uuid NOT NULL,
  equipment_id uuid NOT NULL,
  CONSTRAINT tool_crafts_pkey PRIMARY KEY (tool_id, equipment_id),
  CONSTRAINT tool_crafts_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES public.tools(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT tool_crafts_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipments(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.tool_crafts OWNER TO postgres;
ALTER TABLE public.tool_crafts ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.tool_crafts TO anon;
GRANT ALL ON TABLE public.tool_crafts TO authenticated;
GRANT ALL ON TABLE public.tool_crafts TO service_role;

CREATE INDEX idx_tool_crafts_tool_id
  ON public.tool_crafts USING btree (tool_id);

CREATE INDEX idx_tool_crafts_equipment_id
  ON public.tool_crafts USING btree (equipment_id);


--------------------------------------------------------------------------------
-- TOOL CRAFTS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read tool crafts"
ON public.tool_crafts
FOR SELECT TO anon, authenticated
USING (
  public.can_read_resource(tool_id)
  AND public.can_read_resource(equipment_id)
);

CREATE POLICY "Creators and GMs can create tool crafts"
ON public.tool_crafts
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(tool_id));

CREATE POLICY "Creators and GMs can delete tool crafts"
ON public.tool_crafts
FOR DELETE TO authenticated
USING (public.can_edit_resource(tool_id));
