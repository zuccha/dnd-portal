--------------------------------------------------------------------------------
-- TOOL MODIFIER APPLICATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tool_modifier_applications (
  tool_id uuid NOT NULL,
  tool_modifier_id uuid NOT NULL,
  CONSTRAINT tool_modifier_applications_pkey PRIMARY KEY (tool_id, tool_modifier_id),
  CONSTRAINT tool_modifier_applications_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES public.tools(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT tool_modifier_applications_modifier_id_fkey FOREIGN KEY (tool_modifier_id) REFERENCES public.tool_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.tool_modifier_applications OWNER TO postgres;
ALTER TABLE public.tool_modifier_applications ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.tool_modifier_applications TO anon;
GRANT ALL ON TABLE public.tool_modifier_applications TO authenticated;
GRANT ALL ON TABLE public.tool_modifier_applications TO service_role;

CREATE INDEX idx_tool_modifier_applications_tool_id
  ON public.tool_modifier_applications USING btree (tool_id);

CREATE INDEX idx_tool_modifier_applications_modifier_id
  ON public.tool_modifier_applications USING btree (tool_modifier_id);

CREATE POLICY "Users can read tool modifier applications"
ON public.tool_modifier_applications
FOR SELECT TO anon, authenticated
USING (
  public.can_read_resource(tool_id)
  AND public.can_read_resource(tool_modifier_id)
);

CREATE POLICY "Creators and GMs can create tool modifier applications"
ON public.tool_modifier_applications
FOR INSERT TO authenticated
WITH CHECK (
  public.can_edit_resource(tool_id)
  OR public.can_edit_resource(tool_modifier_id)
);

CREATE POLICY "Creators and GMs can delete tool modifier applications"
ON public.tool_modifier_applications
FOR DELETE TO authenticated
USING (
  public.can_edit_resource(tool_id)
  OR public.can_edit_resource(tool_modifier_id)
);

CREATE OR REPLACE FUNCTION public.replace_tool_modifier_applications(
  p_tool_id uuid,
  p_modifier_ids jsonb)
RETURNS void
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  DELETE FROM public.tool_modifier_applications tma
  WHERE tma.tool_id = p_tool_id
    AND NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text(coalesce(p_modifier_ids, '[]'::jsonb)) v
      WHERE (v.value)::uuid = tma.tool_modifier_id
    );

  INSERT INTO public.tool_modifier_applications (tool_id, tool_modifier_id)
  SELECT DISTINCT
    p_tool_id,
    (v.value)::uuid
  FROM jsonb_array_elements_text(coalesce(p_modifier_ids, '[]'::jsonb)) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.tool_modifier_applications tma
    WHERE tma.tool_id = p_tool_id
      AND tma.tool_modifier_id = (v.value)::uuid
  );
$$;

ALTER FUNCTION public.replace_tool_modifier_applications(p_tool_id uuid, p_modifier_ids jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.replace_tool_modifier_applications(p_tool_id uuid, p_modifier_ids jsonb) TO anon;
GRANT ALL ON FUNCTION public.replace_tool_modifier_applications(p_tool_id uuid, p_modifier_ids jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.replace_tool_modifier_applications(p_tool_id uuid, p_modifier_ids jsonb) TO service_role;
