--------------------------------------------------------------------------------
-- CHARACTER CLASSES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.character_classes (
  resource_id uuid NOT NULL,
  armor_proficiencies public.armor_type[] NOT NULL,
  hp_die public.die_type NOT NULL,
  primary_abilities public.creature_ability[] NOT NULL,
  saving_throw_proficiencies public.creature_ability[] NOT NULL,
  skill_proficiencies_pool public.creature_skill[] NOT NULL,
  skill_proficiencies_pool_quantity smallint NOT NULL,
  weapon_proficiencies public.weapon_type[] NOT NULL,
  CONSTRAINT character_classes_pkey PRIMARY KEY (resource_id),
  CONSTRAINT character_classes_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.character_classes OWNER TO postgres;
ALTER TABLE public.character_classes ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.character_classes TO anon;
GRANT ALL ON TABLE public.character_classes TO authenticated;
GRANT ALL ON TABLE public.character_classes TO service_role;


--------------------------------------------------------------------------------
-- CHARACTER CLASS TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.character_class_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  armor_proficiencies_extra text,
  starting_equipment text,
  weapon_proficiencies_extra text,
  CONSTRAINT character_class_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT character_class_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.character_classes(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT character_class_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.character_class_translations OWNER TO postgres;
ALTER TABLE public.character_class_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.character_class_translations TO anon;
GRANT ALL ON TABLE public.character_class_translations TO authenticated;
GRANT ALL ON TABLE public.character_class_translations TO service_role;


--------------------------------------------------------------------------------
-- CHARACTER CLASS ROW
--------------------------------------------------------------------------------

CREATE TYPE public.character_class_row AS (
  -- Resource
  campaign_id uuid,
  campaign_name text,
  id uuid,
  kind public.resource_kind,
  visibility public.campaign_role,
  name jsonb,
  page jsonb,
  -- Character Class
  armor_proficiencies public.armor_type[],
  hp_die public.die_type,
  primary_abilities public.creature_ability[],
  saving_throw_proficiencies public.creature_ability[],
  skill_proficiencies_pool public.creature_skill[],
  skill_proficiencies_pool_quantity smallint,
  weapon_proficiencies public.weapon_type[],
  -- Character Class Translation
  armor_proficiencies_extra jsonb,
  starting_equipment jsonb,
  weapon_proficiencies_extra jsonb
);


--------------------------------------------------------------------------------
-- CHARACTER CLASS RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_character_class_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'character_class'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a character class', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_character_class_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_character_class_resource_kind
  BEFORE INSERT OR UPDATE ON public.character_classes
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_character_class_resource_kind();

GRANT ALL ON FUNCTION public.validate_character_class_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_character_class_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_character_class_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- CHARACTER CLASSES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read character classes"
ON public.character_classes
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new character classes"
ON public.character_classes
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update character classes"
ON public.character_classes
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete character classes"
ON public.character_classes
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- CHARACTER CLASS TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read character class translations"
ON public.character_class_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new character class translations"
ON public.character_class_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update character class translations"
ON public.character_class_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete character class translations"
ON public.character_class_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- CREATE CHARACTER CLASS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_character_class(
  p_campaign_id uuid,
  p_lang text,
  p_character_class jsonb,
  p_character_class_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.character_classes%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.character_classes, p_character_class);

  v_id := public.create_resource(
    p_campaign_id,
    p_lang,
    p_character_class || jsonb_build_object('kind', 'character_class'::public.resource_kind),
    p_character_class_translation
  );

  INSERT INTO public.character_classes (
    resource_id,
    primary_abilities,
    hp_die,
    saving_throw_proficiencies,
    skill_proficiencies_pool,
    skill_proficiencies_pool_quantity,
    weapon_proficiencies,
    armor_proficiencies
  ) VALUES (
    v_id,
    r.primary_abilities,
    r.hp_die,
    r.saving_throw_proficiencies,
    r.skill_proficiencies_pool,
    r.skill_proficiencies_pool_quantity,
    r.weapon_proficiencies,
    r.armor_proficiencies
  );

  perform public.upsert_character_class_translation(
    v_id,
    p_lang,
    p_character_class_translation
  );

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_character_class(p_campaign_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_character_class(p_campaign_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_character_class(p_campaign_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_character_class(p_campaign_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH CHARACTER CLASS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_character_class(p_id uuid)
RETURNS public.character_class_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    r.campaign_id,
    r.campaign_name,
    r.id,
    r.kind,
    r.visibility,
    r.name,
    r.page,
    c.armor_proficiencies,
    c.hp_die,
    c.primary_abilities,
    c.saving_throw_proficiencies,
    c.skill_proficiencies_pool,
    c.skill_proficiencies_pool_quantity,
    c.weapon_proficiencies,
    coalesce(tt.armor_proficiencies_extra, '{}'::jsonb) AS armor_proficiencies_extra,
    coalesce(tt.starting_equipment, '{}'::jsonb) AS starting_equipment,
    coalesce(tt.weapon_proficiencies_extra, '{}'::jsonb) AS weapon_proficiencies_extra
  FROM public.fetch_resource(p_id) AS r
  JOIN public.character_classes c ON c.resource_id = r.id
  LEFT JOIN (
    SELECT
      c.resource_id AS id,
      jsonb_object_agg(t.lang, t.armor_proficiencies_extra) AS armor_proficiencies_extra,
      jsonb_object_agg(t.lang, t.starting_equipment) AS starting_equipment,
      jsonb_object_agg(t.lang, t.weapon_proficiencies_extra) AS weapon_proficiencies_extra
    FROM public.character_classes c
    LEFT JOIN public.character_class_translations t ON t.resource_id = c.resource_id
    WHERE c.resource_id = p_id
    GROUP BY c.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_character_class(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_character_class(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_character_class(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_character_class(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH CHARACTER CLASSES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_character_classes(
  p_campaign_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.character_class_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'character_class'::public.resource_kind
),
src AS (
  SELECT
    b.id,
    b.campaign_id,
    b.campaign_name,
    b.kind,
    b.visibility,
    b.name,
    b.page,
    c.armor_proficiencies,
    c.hp_die,
    c.primary_abilities,
    c.saving_throw_proficiencies,
    c.skill_proficiencies_pool,
    c.skill_proficiencies_pool_quantity,
    c.weapon_proficiencies
  FROM base b
  JOIN public.character_classes c ON c.resource_id = b.id
),
t AS (
  SELECT
    s.id,
    jsonb_object_agg(t.lang, t.armor_proficiencies_extra) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS armor_proficiencies_extra,
    jsonb_object_agg(t.lang, t.starting_equipment)        FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS starting_equipment,
    jsonb_object_agg(t.lang, t.weapon_proficiencies_extra) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS weapon_proficiencies_extra
  FROM src s
  LEFT JOIN public.character_class_translations t ON t.resource_id = s.id
  LEFT JOIN (SELECT 1) _ ON true
  GROUP BY s.id
)
SELECT
  s.campaign_id,
  s.campaign_name,
  s.id,
  s.kind,
  s.visibility,
  s.name,
  s.page,
  s.armor_proficiencies,
  s.hp_die,
  s.primary_abilities,
  s.saving_throw_proficiencies,
  s.skill_proficiencies_pool,
  s.skill_proficiencies_pool_quantity,
  s.weapon_proficiencies,
  coalesce(tt.armor_proficiencies_extra, '{}'::jsonb) AS armor_proficiencies_extra,
  coalesce(tt.starting_equipment, '{}'::jsonb) AS starting_equipment,
  coalesce(tt.weapon_proficiencies_extra, '{}'::jsonb) AS weapon_proficiencies_extra
FROM src s
LEFT JOIN t tt ON tt.id = s.id
ORDER BY
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'asc'
      THEN (s.name->>coalesce(p_langs[1],'en'))
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'desc'
      THEN (s.name->>coalesce(p_langs[1],'en'))
  END DESC NULLS LAST;
$$;

ALTER FUNCTION public.fetch_character_classes(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_character_classes(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_character_classes(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_character_classes(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT CHARACTER CLASS TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_character_class_translation(
  p_id uuid,
  p_lang text,
  p_character_class_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.character_class_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.character_class_translations, p_character_class_translation);

  INSERT INTO public.character_class_translations AS ct (
    resource_id,
    lang,
    weapon_proficiencies_extra,
    armor_proficiencies_extra,
    starting_equipment
  ) VALUES (
    p_id,
    p_lang,
    r.weapon_proficiencies_extra,
    r.armor_proficiencies_extra,
    r.starting_equipment
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    weapon_proficiencies_extra = excluded.weapon_proficiencies_extra,
    armor_proficiencies_extra = excluded.armor_proficiencies_extra,
    starting_equipment = excluded.starting_equipment;
END;
$$;

ALTER FUNCTION public.upsert_character_class_translation(p_id uuid, p_lang text, p_character_class_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_character_class_translation(p_id uuid, p_lang text, p_character_class_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_character_class_translation(p_id uuid, p_lang text, p_character_class_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_character_class_translation(p_id uuid, p_lang text, p_character_class_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE CHARACTER CLASS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_character_class(
  p_id uuid,
  p_lang text,
  p_character_class jsonb,
  p_character_class_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_rows int;
BEGIN
  perform public.update_resource(
    p_id,
    p_lang,
    p_character_class || jsonb_build_object('kind', 'character_class'::public.resource_kind),
    p_character_class_translation
  );

  UPDATE public.character_classes c
  SET (
    primary_abilities,
    hp_die,
    saving_throw_proficiencies,
    skill_proficiencies_pool,
    skill_proficiencies_pool_quantity,
    weapon_proficiencies,
    armor_proficiencies
  ) = (
    SELECT
      r.primary_abilities,
      r.hp_die,
      r.saving_throw_proficiencies,
      r.skill_proficiencies_pool,
      r.skill_proficiencies_pool_quantity,
      r.weapon_proficiencies,
      r.armor_proficiencies
    FROM jsonb_populate_record(null::public.character_classes, to_jsonb(c) || p_character_class) AS r
  )
  WHERE c.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_character_class_translation(p_id, p_lang, p_character_class_translation);
END;
$$;

ALTER FUNCTION public.update_character_class(p_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_character_class(p_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_character_class(p_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_character_class(p_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO service_role;
