--------------------------------------------------------------------------------
-- WEAPON MODIFIER APPLICATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.weapon_modifier_applications (
  weapon_id uuid NOT NULL,
  weapon_modifier_id uuid NOT NULL,
  CONSTRAINT weapon_modifier_applications_pkey PRIMARY KEY (weapon_id, weapon_modifier_id),
  CONSTRAINT weapon_modifier_applications_weapon_id_fkey FOREIGN KEY (weapon_id) REFERENCES public.weapons(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT weapon_modifier_applications_modifier_id_fkey FOREIGN KEY (weapon_modifier_id) REFERENCES public.weapon_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.weapon_modifier_applications OWNER TO postgres;
ALTER TABLE public.weapon_modifier_applications ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.weapon_modifier_applications TO anon;
GRANT ALL ON TABLE public.weapon_modifier_applications TO authenticated;
GRANT ALL ON TABLE public.weapon_modifier_applications TO service_role;

CREATE INDEX idx_weapon_modifier_applications_weapon_id
  ON public.weapon_modifier_applications USING btree (weapon_id);

CREATE INDEX idx_weapon_modifier_applications_modifier_id
  ON public.weapon_modifier_applications USING btree (weapon_modifier_id);

CREATE POLICY "Users can read weapon modifier applications"
ON public.weapon_modifier_applications
FOR SELECT TO anon, authenticated
USING (
  public.can_read_resource(weapon_id)
  AND public.can_read_resource(weapon_modifier_id)
);

CREATE POLICY "Creators and GMs can create weapon modifier applications"
ON public.weapon_modifier_applications
FOR INSERT TO authenticated
WITH CHECK (
  public.can_edit_resource(weapon_id)
  OR public.can_edit_resource(weapon_modifier_id)
);

CREATE POLICY "Creators and GMs can delete weapon modifier applications"
ON public.weapon_modifier_applications
FOR DELETE TO authenticated
USING (
  public.can_edit_resource(weapon_id)
  OR public.can_edit_resource(weapon_modifier_id)
);

CREATE OR REPLACE FUNCTION public.replace_weapon_modifier_applications(
  p_weapon_id uuid,
  p_modifier_ids jsonb)
RETURNS void
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  DELETE FROM public.weapon_modifier_applications wma
  WHERE wma.weapon_id = p_weapon_id
    AND NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text(coalesce(p_modifier_ids, '[]'::jsonb)) v
      WHERE (v.value)::uuid = wma.weapon_modifier_id
    );

  INSERT INTO public.weapon_modifier_applications (weapon_id, weapon_modifier_id)
  SELECT DISTINCT
    p_weapon_id,
    (v.value)::uuid
  FROM jsonb_array_elements_text(coalesce(p_modifier_ids, '[]'::jsonb)) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.weapon_modifier_applications wma
    WHERE wma.weapon_id = p_weapon_id
      AND wma.weapon_modifier_id = (v.value)::uuid
  );
$$;

ALTER FUNCTION public.replace_weapon_modifier_applications(p_weapon_id uuid, p_modifier_ids jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.replace_weapon_modifier_applications(p_weapon_id uuid, p_modifier_ids jsonb) TO anon;
GRANT ALL ON FUNCTION public.replace_weapon_modifier_applications(p_weapon_id uuid, p_modifier_ids jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.replace_weapon_modifier_applications(p_weapon_id uuid, p_modifier_ids jsonb) TO service_role;
