--------------------------------------------------------------------------------
-- ARMOR MODIFIER APPLICATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.armor_modifier_applications (
  armor_id uuid NOT NULL,
  armor_modifier_id uuid NOT NULL,
  CONSTRAINT armor_modifier_applications_pkey PRIMARY KEY (armor_id, armor_modifier_id),
  CONSTRAINT armor_modifier_applications_armor_id_fkey FOREIGN KEY (armor_id) REFERENCES public.armors(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT armor_modifier_applications_modifier_id_fkey FOREIGN KEY (armor_modifier_id) REFERENCES public.armor_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.armor_modifier_applications OWNER TO postgres;
ALTER TABLE public.armor_modifier_applications ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.armor_modifier_applications TO anon;
GRANT ALL ON TABLE public.armor_modifier_applications TO authenticated;
GRANT ALL ON TABLE public.armor_modifier_applications TO service_role;

CREATE INDEX idx_armor_modifier_applications_armor_id
  ON public.armor_modifier_applications USING btree (armor_id);

CREATE INDEX idx_armor_modifier_applications_modifier_id
  ON public.armor_modifier_applications USING btree (armor_modifier_id);

CREATE POLICY "Users can read armor modifier applications"
ON public.armor_modifier_applications
FOR SELECT TO anon, authenticated
USING (
  public.can_read_resource(armor_id)
  AND public.can_read_resource(armor_modifier_id)
);

CREATE POLICY "Creators and GMs can create armor modifier applications"
ON public.armor_modifier_applications
FOR INSERT TO authenticated
WITH CHECK (
  public.can_edit_resource(armor_id)
  OR public.can_edit_resource(armor_modifier_id)
);

CREATE POLICY "Creators and GMs can delete armor modifier applications"
ON public.armor_modifier_applications
FOR DELETE TO authenticated
USING (
  public.can_edit_resource(armor_id)
  OR public.can_edit_resource(armor_modifier_id)
);

CREATE OR REPLACE FUNCTION public.replace_armor_modifier_applications(
  p_armor_id uuid,
  p_modifier_ids jsonb)
RETURNS void
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  DELETE FROM public.armor_modifier_applications ama
  WHERE ama.armor_id = p_armor_id
    AND NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text(coalesce(p_modifier_ids, '[]'::jsonb)) v
      WHERE (v.value)::uuid = ama.armor_modifier_id
    );

  INSERT INTO public.armor_modifier_applications (armor_id, armor_modifier_id)
  SELECT DISTINCT
    p_armor_id,
    (v.value)::uuid
  FROM jsonb_array_elements_text(coalesce(p_modifier_ids, '[]'::jsonb)) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.armor_modifier_applications ama
    WHERE ama.armor_id = p_armor_id
      AND ama.armor_modifier_id = (v.value)::uuid
  );
$$;

ALTER FUNCTION public.replace_armor_modifier_applications(p_armor_id uuid, p_modifier_ids jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.replace_armor_modifier_applications(p_armor_id uuid, p_modifier_ids jsonb) TO anon;
GRANT ALL ON FUNCTION public.replace_armor_modifier_applications(p_armor_id uuid, p_modifier_ids jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.replace_armor_modifier_applications(p_armor_id uuid, p_modifier_ids jsonb) TO service_role;


