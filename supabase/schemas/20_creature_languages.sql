--------------------------------------------------------------------------------
-- CREATURE LANGUAGES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.creature_languages (
  creature_id uuid NOT NULL,
  language_id uuid NOT NULL,
  CONSTRAINT creature_languages_pkey PRIMARY KEY (creature_id, language_id),
  CONSTRAINT creature_languages_creature_id_fkey FOREIGN KEY (creature_id) REFERENCES public.creatures(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT creature_languages_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.languages(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.creature_languages OWNER TO postgres;
ALTER TABLE public.creature_languages ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.creature_languages TO anon;
GRANT ALL ON TABLE public.creature_languages TO authenticated;
GRANT ALL ON TABLE public.creature_languages TO service_role;

CREATE INDEX idx_creature_languages_creature_id
  ON public.creature_languages USING btree (creature_id);

CREATE INDEX idx_creature_languages_language_id
  ON public.creature_languages USING btree (language_id);


--------------------------------------------------------------------------------
-- CREATURE LANGUAGES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read creature languages"
ON public.creature_languages
FOR SELECT TO anon, authenticated
USING (
  public.can_read_resource(creature_id)
  AND public.can_read_resource(language_id)
);

CREATE POLICY "Creators and GMs can create creature languages"
ON public.creature_languages
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(creature_id));

CREATE POLICY "Creators and GMs can delete creature languages"
ON public.creature_languages
FOR DELETE TO authenticated
USING (public.can_edit_resource(creature_id));
