--------------------------------------------------------------------------------
-- CREATURE PLANES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.creature_planes (
  creature_id uuid NOT NULL,
  plane_id uuid NOT NULL,
  CONSTRAINT creature_planes_pkey PRIMARY KEY (creature_id, plane_id),
  CONSTRAINT creature_planes_creature_id_fkey FOREIGN KEY (creature_id) REFERENCES public.creatures(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT creature_planes_plane_id_fkey FOREIGN KEY (plane_id) REFERENCES public.planes(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.creature_planes OWNER TO postgres;
ALTER TABLE public.creature_planes ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.creature_planes TO anon;
GRANT ALL ON TABLE public.creature_planes TO authenticated;
GRANT ALL ON TABLE public.creature_planes TO service_role;

CREATE INDEX idx_creature_planes_creature_id
  ON public.creature_planes USING btree (creature_id);

CREATE INDEX idx_creature_planes_plane_id
  ON public.creature_planes USING btree (plane_id);


--------------------------------------------------------------------------------
-- CREATURE PLANES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read creature planes"
ON public.creature_planes
FOR SELECT TO anon, authenticated
USING (
  public.can_read_resource(creature_id)
  AND public.can_read_resource(plane_id)
);

CREATE POLICY "Creators and GMs can create creature planes"
ON public.creature_planes
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(creature_id));

CREATE POLICY "Creators and GMs can delete creature planes"
ON public.creature_planes
FOR DELETE TO authenticated
USING (public.can_edit_resource(creature_id));
