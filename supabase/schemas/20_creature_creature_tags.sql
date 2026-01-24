--------------------------------------------------------------------------------
-- CREATURE CREATURE TAGS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.creature_creature_tags (
  creature_id uuid NOT NULL,
  creature_tag_id uuid NOT NULL,
  CONSTRAINT creature_creature_tags_pkey PRIMARY KEY (creature_id, creature_tag_id),
  CONSTRAINT creature_creature_tags_creature_id_fkey FOREIGN KEY (creature_id) REFERENCES public.creatures(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT creature_creature_tags_creature_tag_id_fkey FOREIGN KEY (creature_tag_id) REFERENCES public.creature_tags(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.creature_creature_tags OWNER TO postgres;
ALTER TABLE public.creature_creature_tags ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.creature_creature_tags TO anon;
GRANT ALL ON TABLE public.creature_creature_tags TO authenticated;
GRANT ALL ON TABLE public.creature_creature_tags TO service_role;

CREATE INDEX idx_creature_creature_tags_creature_id
  ON public.creature_creature_tags USING btree (creature_id);

CREATE INDEX idx_creature_creature_tags_creature_tag_id
  ON public.creature_creature_tags USING btree (creature_tag_id);


--------------------------------------------------------------------------------
-- CREATURE CREATURE TAGS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read creature creature tags"
ON public.creature_creature_tags
FOR SELECT TO anon, authenticated
USING (
  public.can_read_resource(creature_id)
  AND public.can_read_resource(creature_tag_id)
);

CREATE POLICY "Creators and GMs can create creature creature tags"
ON public.creature_creature_tags
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(creature_id));

CREATE POLICY "Creators and GMs can delete creature creature tags"
ON public.creature_creature_tags
FOR DELETE TO authenticated
USING (public.can_edit_resource(creature_id));
