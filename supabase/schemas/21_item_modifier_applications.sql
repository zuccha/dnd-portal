--------------------------------------------------------------------------------
-- ITEM MODIFIER APPLICATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.item_modifier_applications (
  item_id uuid NOT NULL,
  item_modifier_id uuid NOT NULL,
  CONSTRAINT item_modifier_applications_pkey PRIMARY KEY (item_id, item_modifier_id),
  CONSTRAINT item_modifier_applications_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT item_modifier_applications_modifier_id_fkey FOREIGN KEY (item_modifier_id) REFERENCES public.item_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.item_modifier_applications OWNER TO postgres;
ALTER TABLE public.item_modifier_applications ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.item_modifier_applications TO anon;
GRANT ALL ON TABLE public.item_modifier_applications TO authenticated;
GRANT ALL ON TABLE public.item_modifier_applications TO service_role;

CREATE INDEX idx_item_modifier_applications_item_id
  ON public.item_modifier_applications USING btree (item_id);

CREATE INDEX idx_item_modifier_applications_modifier_id
  ON public.item_modifier_applications USING btree (item_modifier_id);

CREATE POLICY "Users can read item modifier applications"
ON public.item_modifier_applications
FOR SELECT TO anon, authenticated
USING (
  public.can_read_resource(item_id)
  AND public.can_read_resource(item_modifier_id)
);

CREATE POLICY "Creators and GMs can create item modifier applications"
ON public.item_modifier_applications
FOR INSERT TO authenticated
WITH CHECK (
  public.can_edit_resource(item_id)
  OR public.can_edit_resource(item_modifier_id)
);

CREATE POLICY "Creators and GMs can delete item modifier applications"
ON public.item_modifier_applications
FOR DELETE TO authenticated
USING (
  public.can_edit_resource(item_id)
  OR public.can_edit_resource(item_modifier_id)
);

CREATE OR REPLACE FUNCTION public.replace_item_modifier_applications(
  p_item_id uuid,
  p_modifier_ids jsonb)
RETURNS void
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  DELETE FROM public.item_modifier_applications ima
  WHERE ima.item_id = p_item_id
    AND NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text(coalesce(p_modifier_ids, '[]'::jsonb)) v
      WHERE (v.value)::uuid = ima.item_modifier_id
    );

  INSERT INTO public.item_modifier_applications (item_id, item_modifier_id)
  SELECT DISTINCT
    p_item_id,
    (v.value)::uuid
  FROM jsonb_array_elements_text(coalesce(p_modifier_ids, '[]'::jsonb)) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.item_modifier_applications ima
    WHERE ima.item_id = p_item_id
      AND ima.item_modifier_id = (v.value)::uuid
  );
$$;

ALTER FUNCTION public.replace_item_modifier_applications(p_item_id uuid, p_modifier_ids jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.replace_item_modifier_applications(p_item_id uuid, p_modifier_ids jsonb) TO anon;
GRANT ALL ON FUNCTION public.replace_item_modifier_applications(p_item_id uuid, p_modifier_ids jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.replace_item_modifier_applications(p_item_id uuid, p_modifier_ids jsonb) TO service_role;
