--------------------------------------------------------------------------------
-- WEAPON AMMUNITIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.weapon_ammunitions (
  weapon_id uuid NOT NULL,
  equipment_id uuid NOT NULL,
  CONSTRAINT weapon_ammunitions_pkey PRIMARY KEY (weapon_id, equipment_id),
  CONSTRAINT weapon_ammunitions_weapon_id_fkey FOREIGN KEY (weapon_id) REFERENCES public.weapons(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT weapon_ammunitions_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipments(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.weapon_ammunitions OWNER TO postgres;
ALTER TABLE public.weapon_ammunitions ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.weapon_ammunitions TO anon;
GRANT ALL ON TABLE public.weapon_ammunitions TO authenticated;
GRANT ALL ON TABLE public.weapon_ammunitions TO service_role;

CREATE INDEX idx_weapon_ammunitions_weapon_id
  ON public.weapon_ammunitions USING btree (weapon_id);

CREATE INDEX idx_weapon_ammunitions_equipment_id
  ON public.weapon_ammunitions USING btree (equipment_id);


--------------------------------------------------------------------------------
-- WEAPON AMMUNITIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read weapon ammunitions"
ON public.weapon_ammunitions
FOR SELECT TO anon, authenticated
USING (
  public.can_read_resource(weapon_id)
  AND public.can_read_resource(equipment_id)
);

CREATE POLICY "Creators and GMs can create weapon ammunitions"
ON public.weapon_ammunitions
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(weapon_id));

CREATE POLICY "Creators and GMs can delete weapon ammunitions"
ON public.weapon_ammunitions
FOR DELETE TO authenticated
USING (public.can_edit_resource(weapon_id));
