--------------------------------------------------------------------------------
-- ARMORS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.armors (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  campaign_id uuid DEFAULT gen_random_uuid() NOT NULL,
  visibility public.campaign_role DEFAULT 'player'::public.campaign_role NOT NULL,
  armor_class_max_cha_modifier smallint DEFAULT '0'::integer,
  armor_class_max_con_modifier smallint DEFAULT '0'::integer,
  armor_class_max_dex_modifier smallint DEFAULT '0'::integer,
  armor_class_max_int_modifier smallint DEFAULT '0'::integer,
  armor_class_max_str_modifier smallint DEFAULT '0'::integer,
  armor_class_max_wis_modifier smallint DEFAULT '0'::integer,
  armor_class_modifier smallint DEFAULT '0'::integer NOT NULL,
  base_armor_class smallint DEFAULT '0'::integer NOT NULL,
  cost integer DEFAULT '0'::integer NOT NULL,
  disadvantage_on_stealth boolean DEFAULT 'false'::boolean NOT NULL,
  required_cha smallint DEFAULT '0'::integer NOT NULL,
  required_con smallint DEFAULT '0'::integer NOT NULL,
  required_dex smallint DEFAULT '0'::integer NOT NULL,
  required_int smallint DEFAULT '0'::integer NOT NULL,
  required_str smallint DEFAULT '0'::integer NOT NULL,
  required_wis smallint DEFAULT '0'::integer NOT NULL,
  type public.armor_type NOT NULL,
  weight integer DEFAULT '0'::integer NOT NULL,
  CONSTRAINT armors_pkey PRIMARY KEY (id),
  CONSTRAINT armors_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.armors OWNER TO postgres;
ALTER TABLE public.armors ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.armors TO anon;
GRANT ALL ON TABLE public.armors TO authenticated;
GRANT ALL ON TABLE public.armors TO service_role;


--------------------------------------------------------------------------------
-- ARMOR TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.armor_translations (
  armor_id uuid DEFAULT gen_random_uuid() NOT NULL,
  lang text NOT NULL,
  name text DEFAULT ''::text NOT NULL,
  page smallint,
  notes text,
  CONSTRAINT armor_translations_pkey PRIMARY KEY (armor_id, lang),
  CONSTRAINT armor_translations_armor_id_fkey FOREIGN KEY (armor_id) REFERENCES public.armors(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT armor_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.armor_translations OWNER TO postgres;
ALTER TABLE public.armor_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.armor_translations TO anon;
GRANT ALL ON TABLE public.armor_translations TO authenticated;
GRANT ALL ON TABLE public.armor_translations TO service_role;


--------------------------------------------------------------------------------
-- CAN READ ARMOR TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_read_armor_translation(p_armor_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT can_read_campaign_resource(a.campaign_id, a.visibility)
  FROM public.armors a
  WHERE a.id = p_armor_id;
$$;

ALTER FUNCTION public.can_read_armor_translation(p_armor_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_read_armor_translation(p_armor_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_read_armor_translation(p_armor_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_read_armor_translation(p_armor_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- CAN EDIT ARMOR TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_edit_armor_translation(p_armor_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT can_edit_campaign_resource(a.campaign_id)
  FROM public.armors a
  WHERE a.id = p_armor_id;
$$;

ALTER FUNCTION public.can_edit_armor_translation(p_armor_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_edit_armor_translation(p_armor_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_edit_armor_translation(p_armor_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_edit_armor_translation(p_armor_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- ARMORS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read armors"
ON public.armors
FOR SELECT TO authenticated
USING (public.can_read_campaign_resource(campaign_id, visibility) OR public.can_edit_campaign_resource(campaign_id));

CREATE POLICY "Creators and GMs can create new armors"
ON public.armors
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_campaign_resource(campaign_id));

CREATE POLICY "Creators and GMs can update armors"
ON public.armors
FOR UPDATE TO authenticated
USING (public.can_edit_campaign_resource(campaign_id))
WITH CHECK (public.can_edit_campaign_resource(campaign_id));

CREATE POLICY "Creators and GMs can delete armors"
ON public.armors
FOR DELETE TO authenticated
USING (public.can_edit_campaign_resource(campaign_id));


--------------------------------------------------------------------------------
-- ARMOR TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read armor translations"
ON public.armor_translations
FOR SELECT TO authenticated
USING (public.can_read_armor_translation(armor_id) OR public.can_edit_armor_translation(armor_id));

CREATE POLICY "Creators and GMs can create new armor translations"
ON public.armor_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_armor_translation(armor_id));

CREATE POLICY "Creators and GMs can update armor translations"
ON public.armor_translations
FOR UPDATE TO authenticated
USING (public.can_edit_armor_translation(armor_id))
WITH CHECK (public.can_edit_armor_translation(armor_id));

CREATE POLICY "Creators and GMs can delete armor translations"
ON public.armor_translations
FOR DELETE TO authenticated
USING (public.can_edit_armor_translation(armor_id));


--------------------------------------------------------------------------------
-- CREATE ARMOR
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_armor(
  p_campaign_id uuid,
  p_lang text,
  p_armor jsonb,
  p_armor_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.armors%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.armors, p_armor);

  INSERT INTO public.armors (
    campaign_id, visibility,
    armor_class_max_cha_modifier, armor_class_max_con_modifier,
    armor_class_max_dex_modifier, armor_class_max_int_modifier,
    armor_class_max_str_modifier, armor_class_max_wis_modifier,
    armor_class_modifier, base_armor_class,
    cost, disadvantage_on_stealth,
    required_cha, required_con, required_dex,
    required_int, required_str, required_wis,
    type, weight
  ) VALUES (
    p_campaign_id, r.visibility,
    r.armor_class_max_cha_modifier, r.armor_class_max_con_modifier,
    r.armor_class_max_dex_modifier, r.armor_class_max_int_modifier,
    r.armor_class_max_str_modifier, r.armor_class_max_wis_modifier,
    r.armor_class_modifier, r.base_armor_class,
    r.cost, r.disadvantage_on_stealth,
    r.required_cha, r.required_con, r.required_dex,
    r.required_int, r.required_str, r.required_wis,
    r.type, r.weight
  )
  RETURNING id INTO v_id;

  perform public.upsert_armor_translation(v_id, p_lang, p_armor_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_armor(p_campaign_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_armor(p_campaign_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_armor(p_campaign_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_armor(p_campaign_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH ARMOR
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_armor(p_id uuid)
RETURNS record
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    a.id,
    a.campaign_id,
    c.name                          AS campaign_name,
    a.visibility,
    a.armor_class_max_cha_modifier,
    a.armor_class_max_con_modifier,
    a.armor_class_max_dex_modifier,
    a.armor_class_max_int_modifier,
    a.armor_class_max_str_modifier,
    a.armor_class_max_wis_modifier,
    a.armor_class_modifier,
    a.base_armor_class,
    a.cost,
    a.disadvantage_on_stealth,
    a.required_cha,
    a.required_con,
    a.required_dex,
    a.required_int,
    a.required_str,
    a.required_wis,
    a.type,
    a.weight,
    coalesce(tt.name,  '{}'::jsonb) AS name,
    coalesce(tt.notes, '{}'::jsonb) AS notes,
    coalesce(tt.page,  '{}'::jsonb) AS page
  FROM public.armors a
  JOIN public.campaigns c ON c.id = a.campaign_id
  LEFT JOIN (
    SELECT
      a.id,
      jsonb_object_agg(t.lang, t.name)  AS name,
      jsonb_object_agg(t.lang, t.notes) AS notes,
      jsonb_object_agg(t.lang, t.page)  AS page
    FROM public.armors a
    LEFT JOIN public.armor_translations t ON t.armor_id = a.id
    WHERE a.id = p_id
    GROUP BY a.id
  ) tt ON tt.id = a.id
  WHERE a.id = p_id;
$$;

ALTER FUNCTION public.fetch_armor(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_armor(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_armor(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_armor(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH ARMORS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_armors(
  p_campaign_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS TABLE(
  id uuid,
  campaign_id uuid,
  campaign_name text,
  visibility public.campaign_role,
  armor_class_max_cha_modifier smallint,
  armor_class_max_con_modifier smallint,
  armor_class_max_dex_modifier smallint,
  armor_class_max_int_modifier smallint,
  armor_class_max_str_modifier smallint,
  armor_class_max_wis_modifier smallint,
  armor_class_modifier smallint,
  base_armor_class smallint,
  cost integer,
  disadvantage_on_stealth boolean,
  required_cha smallint,
  required_con smallint,
  required_dex smallint,
  required_int smallint,
  required_str smallint,
  required_wis smallint,
  type public.armor_type,
  weight integer,
  name jsonb,
  notes jsonb,
  page jsonb)
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    -- campaign/modules include/exclude filter (keys are campaign or module ids)
    coalesce(p_filters->'campaigns', '{}'::jsonb) AS campaign_filter,

    -- types
    (
      SELECT coalesce(array_agg((e.key)::public.armor_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'true'
    ) AS types_inc,
    (
      SELECT coalesce(array_agg((e.key)::public.armor_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'false'
    ) AS types_exc
),
src AS (
  SELECT a.*
  FROM public.armors a
  JOIN prefs p ON true
  JOIN public.campaign_resource_ids(p_campaign_id, p.campaign_filter) ci ON ci.id = a.campaign_id
  JOIN public.campaigns c ON c.id = a.campaign_id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
    -- types
        (p.types_inc IS NULL OR s.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (s.type = any(p.types_exc)))
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.name)                                                                                AS name,
    jsonb_object_agg(t.lang, t.notes)       FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS notes,
    jsonb_object_agg(t.lang, t.page)        FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS page
  FROM filtered f
  LEFT JOIN public.armor_translations t ON t.armor_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
)
SELECT
  f.id,
  f.campaign_id,
  c.name                          AS campaign_name,
  f.visibility,
  f.armor_class_max_cha_modifier,
  f.armor_class_max_con_modifier,
  f.armor_class_max_dex_modifier,
  f.armor_class_max_int_modifier,
  f.armor_class_max_str_modifier,
  f.armor_class_max_wis_modifier,
  f.armor_class_modifier,
  f.base_armor_class,
  f.cost,
  f.disadvantage_on_stealth,
  f.required_cha,
  f.required_con,
  f.required_dex,
  f.required_int,
  f.required_str,
  f.required_wis,
  f.type,
  f.weight,
  coalesce(tt.name,  '{}'::jsonb) AS name,
  coalesce(tt.notes, '{}'::jsonb) AS notes,
  coalesce(tt.page,  '{}'::jsonb) AS page
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

ALTER FUNCTION public.fetch_armors(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_armors(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_armors(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_armors(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT ARMOR TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_armor_translation(
  p_id uuid,
  p_lang text,
  p_armor_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.armor_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.armor_translations, p_armor_translation);

  INSERT INTO public.armor_translations AS st (
    armor_id, lang, name, page, notes
  ) VALUES (
    p_id, p_lang, r.name, r.page, r.notes
  )
  ON conflict (armor_id, lang) DO UPDATE
  SET
    name = excluded.name,
    page = excluded.page,
    notes = excluded.notes;
END;
$$;

ALTER FUNCTION public.upsert_armor_translation(p_id uuid, p_lang text, p_armor_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_armor_translation(p_id uuid, p_lang text, p_armor_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_armor_translation(p_id uuid, p_lang text, p_armor_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_armor_translation(p_id uuid, p_lang text, p_armor_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE ARMOR
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_armor(
  p_id uuid,
  p_lang text,
  p_armor jsonb,
  p_armor_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_rows int;
BEGIN
  UPDATE public.armors s
  SET (
    visibility,
    armor_class_max_cha_modifier, armor_class_max_con_modifier,
    armor_class_max_dex_modifier, armor_class_max_int_modifier,
    armor_class_max_str_modifier, armor_class_max_wis_modifier,
    armor_class_modifier, base_armor_class,
    cost, disadvantage_on_stealth,
    required_cha, required_con, required_dex,
    required_int, required_str, required_wis,
    type, weight
  ) = (
    SELECT r.visibility,
      r.armor_class_max_cha_modifier, r.armor_class_max_con_modifier,
      r.armor_class_max_dex_modifier, r.armor_class_max_int_modifier,
      r.armor_class_max_str_modifier, r.armor_class_max_wis_modifier,
      r.armor_class_modifier, r.base_armor_class,
      r.cost, r.disadvantage_on_stealth,
      r.required_cha, r.required_con, r.required_dex,
      r.required_int, r.required_str, r.required_wis,
      r.type, r.weight
    FROM jsonb_populate_record(null::public.armors, to_jsonb(s) || p_armor) AS r
  )
  WHERE s.id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_armor_translation(p_id, p_lang, p_armor_translation);
END;
$$;

ALTER FUNCTION public.update_armor(p_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_armor(p_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_armor(p_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_armor(p_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) TO service_role;
