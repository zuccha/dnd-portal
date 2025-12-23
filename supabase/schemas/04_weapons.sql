--------------------------------------------------------------------------------
-- WEAPONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.weapons (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  campaign_id uuid DEFAULT gen_random_uuid() NOT NULL,
  damage text DEFAULT ''::text NOT NULL,
  damage_versatile text,
  damage_type public.damage_type NOT NULL,
  properties public.weapon_property[] NOT NULL,
  mastery public.weapon_mastery NOT NULL,
  melee boolean NOT NULL,
  ranged boolean NOT NULL,
  magic boolean NOT NULL,
  range_short integer,
  range_long integer,
  range_ft_short real,
  range_ft_long real,
  range_m_short real,
  range_m_long real,
  weight integer DEFAULT '0'::integer NOT NULL,
  weight_lb real NOT NULL,
  weight_kg real NOT NULL,
  cost real NOT NULL,
  visibility public.campaign_role DEFAULT 'player'::public.campaign_role NOT NULL,
  type public.weapon_type NOT NULL,
  CONSTRAINT weapons_pkey PRIMARY KEY (id),
  CONSTRAINT weapons_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT weapons_damage_versatile_check CHECK (((damage_versatile IS NOT NULL) = (properties @> ARRAY['versatile'::public.weapon_property]))),
  CONSTRAINT weapons_ranged_range_check CHECK ((ranged = ((range_short IS NOT NULL) AND (range_long IS NOT NULL) AND (range_ft_short IS NOT NULL) AND (range_ft_long IS NOT NULL) AND (range_m_short IS NOT NULL) AND (range_m_long IS NOT NULL))))
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
  weapon_id uuid DEFAULT gen_random_uuid() NOT NULL,
  lang text NOT NULL,
  name text DEFAULT ''::text NOT NULL,
  page smallint,
  notes text,
  ammunition text,
  CONSTRAINT weapon_translations_pkey PRIMARY KEY (weapon_id, lang),
  CONSTRAINT weapon_translations_weapon_id_fkey FOREIGN KEY (weapon_id) REFERENCES public.weapons(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT weapon_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.weapon_translations OWNER TO postgres;
ALTER TABLE public.weapon_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.weapon_translations TO anon;
GRANT ALL ON TABLE public.weapon_translations TO authenticated;
GRANT ALL ON TABLE public.weapon_translations TO service_role;


--------------------------------------------------------------------------------
-- CAN READ WEAPON TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_read_weapon_translation(p_weapon_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT can_read_campaign_resource(w.campaign_id, w.visibility)
  FROM public.weapons w
  WHERE w.id = p_weapon_id;
$$;

ALTER FUNCTION public.can_read_weapon_translation(p_weapon_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_read_weapon_translation(p_weapon_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_read_weapon_translation(p_weapon_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_read_weapon_translation(p_weapon_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- CAN EDIT WEAPON TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_edit_weapon_translation(p_weapon_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT can_edit_campaign_resource(w.campaign_id)
  FROM public.weapons w
  WHERE w.id = p_weapon_id;
$$;

ALTER FUNCTION public.can_edit_weapon_translation(p_weapon_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_edit_weapon_translation(p_weapon_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_edit_weapon_translation(p_weapon_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_edit_weapon_translation(p_weapon_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- WEAPONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read weapons"
ON public.weapons
FOR SELECT TO authenticated
USING (public.can_read_campaign_resource(campaign_id, visibility) OR public.can_edit_campaign_resource(campaign_id));

CREATE POLICY "Creators and GMs can create new weapons"
ON public.weapons
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_campaign_resource(campaign_id));

CREATE POLICY "Creators and GMs can update weapons"
ON public.weapons
FOR UPDATE TO authenticated
USING (public.can_edit_campaign_resource(campaign_id))
WITH CHECK (public.can_edit_campaign_resource(campaign_id));

CREATE POLICY "Creators and GMs can delete weapons"
ON public.weapons
FOR DELETE TO authenticated
USING (public.can_edit_campaign_resource(campaign_id));


--------------------------------------------------------------------------------
-- WEAPON TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read weapon translations"
ON public.weapon_translations
FOR SELECT TO authenticated
USING (public.can_read_weapon_translation(weapon_id) OR public.can_edit_weapon_translation(weapon_id));

CREATE POLICY "Creators and GMs can create new weapon translations"
ON public.weapon_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_weapon_translation(weapon_id));

CREATE POLICY "Creators and GMs can update weapon translations"
ON public.weapon_translations
FOR UPDATE TO authenticated
USING (public.can_edit_weapon_translation(weapon_id))
WITH CHECK (public.can_edit_weapon_translation(weapon_id));

CREATE POLICY "Creators and GMs can delete weapon translations"
ON public.weapon_translations
FOR DELETE TO authenticated
USING (public.can_edit_weapon_translation(weapon_id));


--------------------------------------------------------------------------------
-- CREATE WEAPON
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_weapon(
  p_campaign_id uuid,
  p_lang text,
  p_weapon jsonb,
  p_weapon_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.weapons%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.weapons, p_weapon);

  INSERT INTO public.weapons (
    campaign_id, type, damage, damage_versatile, damage_type,
    properties, mastery, melee, ranged, magic,
    range_short, range_long, range_ft_short, range_ft_long, range_m_short, range_m_long,
    weight, weight_kg, weight_lb, cost, visibility
  ) VALUES (
    p_campaign_id, r.type, r.damage, r.damage_versatile, r.damage_type,
    r.properties, r.mastery, r.melee, r.ranged, r.magic,
    r.range_short, r.range_long, r.range_ft_short, r.range_ft_long, r.range_m_short, r.range_m_long,
    r.weight, r.weight_kg, r.weight_lb, r.cost, r.visibility
  )
  RETURNING id INTO v_id;

  perform public.upsert_weapon_translation(v_id, p_lang, p_weapon_translation);

  RETURN v_id;
END;
$$;


ALTER FUNCTION public.create_weapon(p_campaign_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_weapon(p_campaign_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_weapon(p_campaign_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_weapon(p_campaign_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH WEAPON
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_weapon(p_id uuid)
RETURNS record
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    w.id,
    w.campaign_id,
    c.name                                AS campaign_name,
    w.type,
    w.damage,
    w.damage_type,
    w.damage_versatile,
    w.mastery,
    w.properties,
    w.magic,
    w.melee,
    w.ranged,
    w.range_long,
    w.range_short,
    w.range_ft_long,
    w.range_ft_short,
    w.range_m_long,
    w.range_m_short,
    w.weight,
    w.weight_kg,
    w.weight_lb,
    w.cost,
    coalesce(tt.name,       '{}'::jsonb)  AS name,
    coalesce(tt.notes,      '{}'::jsonb)  AS notes,
    coalesce(tt.page,       '{}'::jsonb)  AS page,
    coalesce(tt.ammunition, '{}'::jsonb)  AS ammunition,
    w.visibility
  FROM public.weapons w
  JOIN public.campaigns c ON c.id = w.campaign_id
  LEFT JOIN (
    SELECT
      w.id,
      jsonb_object_agg(t.lang, t.name)        AS name,
      jsonb_object_agg(t.lang, t.notes)       AS notes,
      jsonb_object_agg(t.lang, t.page)        AS page,
      jsonb_object_agg(t.lang, t.ammunition)  AS ammunition
    FROM public.weapons w
    LEFT JOIN public.weapon_translations t ON t.weapon_id = w.id
    WHERE w.id = p_id
    GROUP BY w.id
  ) tt ON tt.id = w.id
  WHERE w.id = p_id;
$$;

ALTER FUNCTION public.fetch_weapon(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_weapon(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_weapon(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_weapon(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH WEAPONS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_weapons(
  p_campaign_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS TABLE(
  id uuid,
  campaign_id uuid,
  campaign_name text,
  type public.weapon_type,
  damage text,
  damage_type public.damage_type,
  damage_versatile text,
  mastery public.weapon_mastery,
  properties public.weapon_property[],
  magic boolean,
  melee boolean,
  ranged boolean,
  range_long integer,
  range_short integer,
  range_ft_long real,
  range_ft_short real,
  range_m_long real,
  range_m_short real,
  weight integer,
  weight_kg real,
  weight_lb real,
  cost real,
  name jsonb,
  notes jsonb,
  page jsonb,
  ammunition jsonb,
  visibility public.campaign_role)
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    -- campaign/modules include/exclude filter (keys are campaign or module ids)
    coalesce(p_filters->'campaigns', '{}'::jsonb) AS campaign_filter,

    -- types
    (
      SELECT coalesce(array_agg((e.key)::public.weapon_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'true'
    ) AS types_inc,
    (
      SELECT coalesce(array_agg((e.key)::public.weapon_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'false'
    ) AS types_exc,

    -- properties
    (
      SELECT coalesce(array_agg(lower(e.key)::public.weapon_property), null)
      FROM jsonb_each_text(p_filters->'weapon_properties') AS e(key, value)
      WHERE e.value = 'true'
    ) AS properties_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.weapon_property), null)
      FROM jsonb_each_text(p_filters->'weapon_properties') AS e(key, value)
      WHERE e.value = 'false'
    ) AS properties_exc,

    -- mastery
    (
      SELECT coalesce(array_agg(lower(e.key)::public.weapon_mastery), null)
      FROM jsonb_each_text(p_filters->'masteries') AS e(key, value)
      WHERE e.value = 'true'
    ) AS masteries_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.weapon_mastery), null)
      FROM jsonb_each_text(p_filters->'masteries') AS e(key, value)
      WHERE e.value = 'false'
    ) AS masteries_exc,

    -- boolean flags; null = not relevant
    (p_filters ? 'magic')::int::boolean   AS has_magic_filter,
    (p_filters->>'magic')::boolean        AS magic_val,

    (p_filters ? 'melee')::int::boolean   AS has_melee_filter,
    (p_filters->>'melee')::boolean        AS melee_val,

    (p_filters ? 'ranged')::int::boolean  AS has_ranged_filter,
    (p_filters->>'ranged')::boolean       AS ranged_val
),
src AS (
  SELECT w.*
  FROM public.weapons w
  JOIN prefs p ON true
  JOIN public.campaign_resource_ids(p_campaign_id, p.campaign_filter) ci ON ci.id = w.campaign_id
  JOIN public.campaigns c ON c.id = w.campaign_id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
    -- types
        (p.types_inc IS NULL OR s.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (s.type = any(p.types_exc)))

    -- properties
    AND (p.properties_inc IS NULL OR s.properties && p.properties_inc)
    AND (p.properties_exc IS NULL OR NOT (s.properties && p.properties_exc))

    -- masteries
    AND (p.masteries_inc IS NULL OR s.mastery = any(p.masteries_inc))
    AND (p.masteries_exc IS NULL OR NOT (s.mastery = any(p.masteries_exc)))

    -- flags
    AND (NOT p.has_magic_filter  OR s.magic  = p.magic_val)
    AND (NOT p.has_melee_filter  OR s.melee  = p.melee_val)
    AND (NOT p.has_ranged_filter OR s.ranged = p.ranged_val)
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.name)                                                                                AS name,
    jsonb_object_agg(t.lang, t.notes)       FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS notes,
    jsonb_object_agg(t.lang, t.page)        FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS page,
    jsonb_object_agg(t.lang, t.ammunition)  FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS ammunition
  FROM filtered f
  LEFT JOIN public.weapon_translations t ON t.weapon_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
)
SELECT
  f.id,
  f.campaign_id,
  c.name                                AS campaign_name,
  f.type,
  f.damage,
  f.damage_type,
  f.damage_versatile,
  f.mastery,
  f.properties,
  f.magic,
  f.melee,
  f.ranged,
  f.range_long,
  f.range_short,
  f.range_ft_long,
  f.range_ft_short,
  f.range_m_long,
  f.range_m_short,
  f.weight,
  f.weight_kg,
  f.weight_lb,
  f.cost,
  coalesce(tt.name,       '{}'::jsonb)  AS name,
  coalesce(tt.notes,      '{}'::jsonb)  AS notes,
  coalesce(tt.page,       '{}'::jsonb)  AS page,
  coalesce(tt.ammunition, '{}'::jsonb)  AS ammunition,
  f.visibility
FROM filtered f
JOIN public.campaigns c ON c.id = f.campaign_id
LEFT JOIN t tt ON tt.id = f.id
ORDER BY
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'asc'
      THEN (tt.name->>coalesce(p_langs[1],'en'))
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'desc'
      THEN (tt.name->>coalesce(p_langs[1],'en'))
  END DESC NULLS LAST;
$$;

ALTER FUNCTION public.fetch_weapons(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_weapons(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_weapons(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_weapons(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT WEAPON TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_weapon_translation(
  p_id uuid,
  p_lang text,
  p_weapon_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.weapon_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.weapon_translations, p_weapon_translation);

  INSERT INTO public.weapon_translations AS st (
    weapon_id, lang, name, page,
    ammunition, notes
  ) VALUES (
    p_id, p_lang, r.name, r.page,
    r.ammunition, r.notes
  )
  ON conflict (weapon_id, lang) DO UPDATE
  SET
    name = excluded.name,
    page = excluded.page,
    ammunition = excluded.ammunition,
    notes = excluded.notes;
END;
$$;

ALTER FUNCTION public.upsert_weapon_translation(p_id uuid, p_lang text, p_weapon_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_weapon_translation(p_id uuid, p_lang text, p_weapon_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_weapon_translation(p_id uuid, p_lang text, p_weapon_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_weapon_translation(p_id uuid, p_lang text, p_weapon_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE WEAPON
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_weapon(
  p_id uuid,
  p_lang text,
  p_weapon jsonb,
  p_weapon_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_rows int;
BEGIN
  UPDATE public.weapons s
  SET (
    type, damage, damage_versatile, damage_type,
    properties, mastery, melee, ranged, magic,
    range_short, range_long, range_ft_short, range_ft_long, range_m_short, range_m_long,
    weight, weight_kg, weight_lb, cost, visibility
  ) = (
    SELECT r.type, r.damage, r.damage_versatile, r.damage_type,
           r.properties, r.mastery, r.melee, r.ranged, r.magic,
           r.range_short, r.range_long, r.range_ft_short, r.range_ft_long, r.range_m_short, r.range_m_long,
           r.weight, r.weight_kg, r.weight_lb, r.cost, r.visibility
    FROM jsonb_populate_record(null::public.weapons, to_jsonb(s) || p_weapon) AS r
  )
  WHERE s.id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_weapon_translation(p_id, p_lang, p_weapon_translation);
END;
$$;

ALTER FUNCTION public.update_weapon(p_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_weapon(p_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_weapon(p_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_weapon(p_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) TO service_role;
