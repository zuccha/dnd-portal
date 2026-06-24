--------------------------------------------------------------------------------
-- EQUIPMENT MODIFIER APPLICATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.equipment_modifier_applications (
  equipment_id uuid NOT NULL,
  equipment_modifier_id uuid NOT NULL,
  CONSTRAINT equipment_modifier_applications_pkey PRIMARY KEY (equipment_id, equipment_modifier_id),
  CONSTRAINT equipment_modifier_applications_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipments(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT equipment_modifier_applications_modifier_id_fkey FOREIGN KEY (equipment_modifier_id) REFERENCES public.equipment_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.equipment_modifier_applications OWNER TO postgres;
ALTER TABLE public.equipment_modifier_applications ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.equipment_modifier_applications TO anon;
GRANT ALL ON TABLE public.equipment_modifier_applications TO authenticated;
GRANT ALL ON TABLE public.equipment_modifier_applications TO service_role;

CREATE INDEX idx_equipment_modifier_applications_equipment_id
  ON public.equipment_modifier_applications USING btree (equipment_id);

CREATE INDEX idx_equipment_modifier_applications_modifier_id
  ON public.equipment_modifier_applications USING btree (equipment_modifier_id);


--------------------------------------------------------------------------------
-- EQUIPMENT MODIFIER APPLICATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read equipment modifier applications"
ON public.equipment_modifier_applications
FOR SELECT TO anon, authenticated
USING (
  public.can_read_resource(equipment_id)
  AND public.can_read_resource(equipment_modifier_id)
);

CREATE POLICY "Creators and GMs can create equipment modifier applications"
ON public.equipment_modifier_applications
FOR INSERT TO authenticated
WITH CHECK (
  public.can_edit_resource(equipment_id)
  OR public.can_edit_resource(equipment_modifier_id)
);

CREATE POLICY "Creators and GMs can delete equipment modifier applications"
ON public.equipment_modifier_applications
FOR DELETE TO authenticated
USING (
  public.can_edit_resource(equipment_id)
  OR public.can_edit_resource(equipment_modifier_id)
);
