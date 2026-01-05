--------------------------------------------------------------------------------
-- CREATURES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.creatures (
  resource_id uuid NOT NULL,
  ability_cha smallint DEFAULT '10'::smallint NOT NULL,
  ability_con smallint DEFAULT '10'::smallint NOT NULL,
  ability_dex smallint DEFAULT '10'::smallint NOT NULL,
  ability_int smallint DEFAULT '10'::smallint NOT NULL,
  ability_proficiencies public.creature_ability[] NOT NULL,
  ability_str smallint DEFAULT '10'::smallint NOT NULL,
  ability_wis smallint DEFAULT '10'::smallint NOT NULL,
  ac smallint DEFAULT '0'::smallint NOT NULL,
  alignment public.creature_alignment NOT NULL,
  blindsight integer DEFAULT '0'::integer NOT NULL,
  condition_immunities public.creature_condition[] NOT NULL,
  condition_resistances public.creature_condition[] NOT NULL,
  condition_vulnerabilities public.creature_condition[] NOT NULL,
  cr numeric DEFAULT '0'::smallint NOT NULL,
  darkvision integer DEFAULT '0'::integer NOT NULL,
  damage_immunities public.damage_type[] NOT NULL,
  damage_resistances public.damage_type[] NOT NULL,
  damage_vulnerabilities public.damage_type[] NOT NULL,
  habitats public.creature_habitat[] NOT NULL,
  hp smallint DEFAULT '10'::smallint NOT NULL,
  hp_formula text DEFAULT ''::text NOT NULL,
  initiative smallint DEFAULT '0'::smallint NOT NULL,
  passive_perception smallint DEFAULT '0'::smallint NOT NULL,
  size public.creature_size NOT NULL,
  skill_expertise public.creature_skill[] DEFAULT '{}'::public.creature_skill[] NOT NULL,
  skill_proficiencies public.creature_skill[] NOT NULL,
  speed_burrow integer DEFAULT '0'::integer NOT NULL,
  speed_climb integer DEFAULT '0'::integer NOT NULL,
  speed_fly integer DEFAULT '0'::integer NOT NULL,
  speed_swim integer DEFAULT '0'::integer NOT NULL,
  speed_walk integer DEFAULT '0'::integer NOT NULL,
  treasures public.creature_treasure[] NOT NULL,
  tremorsense integer DEFAULT '0'::integer NOT NULL,
  truesight integer DEFAULT '0'::integer NOT NULL,
  type public.creature_type NOT NULL,
  CONSTRAINT creature_pkey PRIMARY KEY (resource_id),
  CONSTRAINT creature_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.creatures OWNER TO postgres;
ALTER TABLE public.creatures ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.creatures TO anon;
GRANT ALL ON TABLE public.creatures TO authenticated;
GRANT ALL ON TABLE public.creatures TO service_role;


--------------------------------------------------------------------------------
-- CREATURE TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.creature_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  actions text,
  bonus_actions text,
  gear text,
  languages text,
  legendary_actions text,
  planes text,
  reactions text,
  senses text,
  traits text,
  CONSTRAINT creature_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT creature_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.creatures(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT creature_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.creature_translations OWNER TO postgres;
ALTER TABLE public.creature_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.creature_translations TO anon;
GRANT ALL ON TABLE public.creature_translations TO authenticated;
GRANT ALL ON TABLE public.creature_translations TO service_role;


--------------------------------------------------------------------------------
-- CREATURE RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_creature_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'creature'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a creature', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_creature_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_creature_resource_kind
  BEFORE INSERT OR UPDATE ON public.creatures
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_creature_resource_kind();

GRANT ALL ON FUNCTION public.validate_creature_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_creature_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_creature_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- CREATURES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read creatures"
ON public.creatures
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new creatures"
ON public.creatures
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update creatures"
ON public.creatures
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete creatures"
ON public.creatures
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- CREATURE TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read creature translations"
ON public.creature_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new creature translations"
ON public.creature_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update creature translations"
ON public.creature_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete creature translations"
ON public.creature_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

