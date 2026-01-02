--------------------------------------------------------------------------------
-- CHARACTER CLASS SPELLS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.character_class_spells (
  character_class_id uuid NOT NULL,
  spell_id uuid NOT NULL,
  CONSTRAINT character_class_spells_pkey PRIMARY KEY (character_class_id, spell_id),
  CONSTRAINT character_class_spells_character_class_id_fkey FOREIGN KEY (character_class_id) REFERENCES public.character_classes(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT character_class_spells_spell_id_fkey FOREIGN KEY (spell_id) REFERENCES public.spells(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.character_class_spells OWNER TO postgres;
ALTER TABLE public.character_class_spells ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.character_class_spells TO anon;
GRANT ALL ON TABLE public.character_class_spells TO authenticated;
GRANT ALL ON TABLE public.character_class_spells TO service_role;

CREATE INDEX idx_character_class_spells_class_id ON public.character_class_spells USING btree (character_class_id);
CREATE INDEX idx_character_class_spells_spell_id ON public.character_class_spells USING btree (spell_id);


--------------------------------------------------------------------------------
-- CHARACTER CLASS SPELLS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read character class spells"
ON public.character_class_spells
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(character_class_id) AND public.can_read_resource(spell_id));

CREATE POLICY "Creators and GMs can create character class spells"
ON public.character_class_spells
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(character_class_id));

CREATE POLICY "Creators and GMs can delete character class spells"
ON public.character_class_spells
FOR DELETE TO authenticated
USING (public.can_edit_resource(character_class_id));
