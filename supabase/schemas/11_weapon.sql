--------------------------------------------------------------------------------
-- WEAPONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.weapons (
  resource_id uuid NOT NULL,
  damage text DEFAULT ''::text NOT NULL,
  damage_versatile text,
  damage_type public.damage_type NOT NULL,
  properties public.weapon_property[] NOT NULL,
  mastery public.weapon_mastery NOT NULL,
  melee boolean NOT NULL,
  ranged boolean NOT NULL,
  range_short integer,
  range_long integer,
  type public.weapon_type NOT NULL,
  CONSTRAINT weapons_pkey PRIMARY KEY (resource_id),
  CONSTRAINT weapons_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.equipments(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT weapons_damage_versatile_check CHECK (((damage_versatile IS NOT NULL) = (properties @> ARRAY['versatile'::public.weapon_property]))),
  CONSTRAINT weapons_ranged_range_check CHECK ((ranged = ((range_short IS NOT NULL) AND (range_long IS NOT NULL))))
);

ALTER TABLE public.weapons OWNER TO postgres;
ALTER TABLE public.weapons ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.weapons TO anon;
GRANT ALL ON TABLE public.weapons TO authenticated;
GRANT ALL ON TABLE public.weapons TO service_role;


--------------------------------------------------------------------------------
-- WEAPON TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.weapon_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  ammunition text,
  CONSTRAINT weapon_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT weapon_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.weapons(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT weapon_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.weapon_translations OWNER TO postgres;
ALTER TABLE public.weapon_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.weapon_translations TO anon;
GRANT ALL ON TABLE public.weapon_translations TO authenticated;
GRANT ALL ON TABLE public.weapon_translations TO service_role;


--------------------------------------------------------------------------------
-- WEAPONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read weapons"
ON public.weapons
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new weapons"
ON public.weapons
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update weapons"
ON public.weapons
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete weapons"
ON public.weapons
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- WEAPON TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read weapon translations"
ON public.weapon_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new weapon translations"
ON public.weapon_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update weapon translations"
ON public.weapon_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete weapon translations"
ON public.weapon_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

