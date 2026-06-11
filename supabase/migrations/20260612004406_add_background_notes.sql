CREATE TABLE IF NOT EXISTS public.background_translations (
  resource_id uuid NOT NULL,
  lang text DEFAULT ''::text NOT NULL,
  feat_notes text DEFAULT ''::text NOT NULL,
  tool_notes text DEFAULT ''::text NOT NULL,
  CONSTRAINT background_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT background_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.backgrounds(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT background_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.background_translations OWNER TO postgres;
ALTER TABLE public.background_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.background_translations TO anon;
GRANT ALL ON TABLE public.background_translations TO authenticated;
GRANT ALL ON TABLE public.background_translations TO service_role;

CREATE POLICY "Users can read background translations"
ON public.background_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new background translations"
ON public.background_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update background translations"
ON public.background_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete background translations"
ON public.background_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

DROP FUNCTION IF EXISTS public.create_background(uuid, text, jsonb, jsonb);
DROP FUNCTION IF EXISTS public.fetch_background(uuid);
DROP FUNCTION IF EXISTS public.fetch_backgrounds(uuid, text[], jsonb, text, text);
DROP FUNCTION IF EXISTS public.update_background(uuid, text, jsonb, jsonb);
DROP TYPE IF EXISTS public.background_row;

CREATE TYPE public.background_row AS (
  source_id uuid,
  source_code text,
  source_version public.source_version,
  id uuid,
  kind public.resource_kind,
  visibility public.resource_visibility,
  image_url text,
  name jsonb,
  name_short jsonb,
  page jsonb,
  ability_scores public.creature_ability[],
  feat_id uuid,
  skill_proficiencies public.creature_skill[],
  starting_equipment_entries jsonb,
  tool_proficiency_id uuid,
  feat_notes jsonb,
  tool_notes jsonb
);

CREATE OR REPLACE FUNCTION public.create_background(
  p_source_id uuid,
  p_lang text,
  p_background jsonb,
  p_background_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.backgrounds%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.backgrounds, p_background);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_background || jsonb_build_object('kind', 'background'::public.resource_kind),
    p_background_translation
  );

  INSERT INTO public.backgrounds (
    resource_id,
    ability_scores,
    feat_id,
    skill_proficiencies,
    tool_proficiency_id
  ) VALUES (
    v_id,
    r.ability_scores,
    r.feat_id,
    r.skill_proficiencies,
    r.tool_proficiency_id
  );

  INSERT INTO public.background_starting_equipment (
    background_id,
    choice_group,
    choice_option,
    equipment_id,
    quantity
  )
  SELECT
    v_id,
    e.choice_group,
    e.choice_option,
    e.equipment_id,
    e.quantity
  FROM (
    SELECT
      coalesce(e.choice_group, 1) AS choice_group,
      e.choice_option AS choice_option,
      e.equipment_id AS equipment_id,
      sum(coalesce(e.quantity, 1))::smallint AS quantity
    FROM jsonb_to_recordset(
      coalesce(p_background->'starting_equipment_entries', '[]'::jsonb)
    ) AS e(
      choice_group smallint,
      choice_option smallint,
      equipment_id uuid,
      quantity smallint
    )
    GROUP BY
      coalesce(e.choice_group, 1),
      e.choice_option,
      e.equipment_id
  ) e;

  perform public.upsert_background_translation(
    v_id,
    p_lang,
    p_background_translation
  );

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_background(p_source_id uuid, p_lang text, p_background jsonb, p_background_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_background(p_source_id uuid, p_lang text, p_background jsonb, p_background_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_background(p_source_id uuid, p_lang text, p_background jsonb, p_background_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_background(p_source_id uuid, p_lang text, p_background jsonb, p_background_translation jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.fetch_background(p_id uuid)
RETURNS public.background_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    r.source_id,
    r.source_code,
    r.source_version,
    r.id,
    r.kind,
    r.visibility,
    r.image_url,
    r.name,
    r.name_short,
    r.page,
    b.ability_scores,
    b.feat_id,
    b.skill_proficiencies,
    coalesce(se.starting_equipment_entries, '[]'::jsonb) AS starting_equipment_entries,
    b.tool_proficiency_id,
    coalesce(tt.feat_notes, '{}'::jsonb) AS feat_notes,
    coalesce(tt.tool_notes, '{}'::jsonb) AS tool_notes
  FROM public.fetch_resource(p_id) AS r
  JOIN public.backgrounds b ON b.resource_id = r.id
  LEFT JOIN (
    SELECT
      se.background_id AS id,
      jsonb_agg(
        jsonb_build_object(
          'choice_group', se.choice_group,
          'choice_option', se.choice_option,
          'equipment_id', se.equipment_id,
          'quantity', se.quantity
        )
        ORDER BY se.choice_group, se.choice_option, se.id
      ) AS starting_equipment_entries
    FROM public.background_starting_equipment se
    WHERE se.background_id = p_id
    GROUP BY se.background_id
  ) se ON se.id = r.id
  LEFT JOIN (
    SELECT
      b.resource_id AS id,
      jsonb_object_agg(t.lang, t.feat_notes) AS feat_notes,
      jsonb_object_agg(t.lang, t.tool_notes) AS tool_notes
    FROM public.backgrounds b
    LEFT JOIN public.background_translations t ON t.resource_id = b.resource_id
    WHERE b.resource_id = p_id
    GROUP BY b.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_background(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_background(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_background(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_background(p_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.fetch_backgrounds(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.background_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'background'::public.resource_kind
),
src AS (
  SELECT
    b.id,
    b.source_id,
    b.source_code,
    b.source_version,
    b.kind,
    b.visibility,
    b.image_url,
    b.name,
    b.name_short,
    b.page,
    bg.ability_scores,
    bg.feat_id,
    bg.skill_proficiencies,
    bg.tool_proficiency_id
  FROM base b
  JOIN public.backgrounds bg ON bg.resource_id = b.id
),
tse AS (
  SELECT
    se.background_id AS id,
    jsonb_agg(
      jsonb_build_object(
        'choice_group', se.choice_group,
        'choice_option', se.choice_option,
        'equipment_id', se.equipment_id,
        'quantity', se.quantity
      )
      ORDER BY se.choice_group, se.choice_option, se.id
    ) AS starting_equipment_entries
  FROM public.background_starting_equipment se
  GROUP BY se.background_id
),
t AS (
  SELECT
    s.id,
    jsonb_object_agg(t.lang, t.feat_notes) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS feat_notes,
    jsonb_object_agg(t.lang, t.tool_notes) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS tool_notes
  FROM src s
  LEFT JOIN public.background_translations t ON t.resource_id = s.id
  LEFT JOIN (SELECT 1) _ ON true
  GROUP BY s.id
)
SELECT
  s.source_id,
  s.source_code,
  s.source_version,
  s.id,
  s.kind,
  s.visibility,
  s.image_url,
  s.name,
  s.name_short,
  s.page,
  s.ability_scores,
  s.feat_id,
  s.skill_proficiencies,
  coalesce(tse.starting_equipment_entries, '[]'::jsonb) AS starting_equipment_entries,
  s.tool_proficiency_id,
  coalesce(tt.feat_notes, '{}'::jsonb) AS feat_notes,
  coalesce(tt.tool_notes, '{}'::jsonb) AS tool_notes
FROM src s
LEFT JOIN tse ON tse.id = s.id
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

ALTER FUNCTION public.fetch_backgrounds(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_backgrounds(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_backgrounds(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_backgrounds(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;

CREATE OR REPLACE FUNCTION public.upsert_background_translation(
  p_id uuid,
  p_lang text,
  p_background_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.background_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.background_translations, p_background_translation);

  INSERT INTO public.background_translations AS bt (
    resource_id, lang, feat_notes, tool_notes
  ) VALUES (
    p_id, p_lang, r.feat_notes, r.tool_notes
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    feat_notes = excluded.feat_notes,
    tool_notes = excluded.tool_notes;
END;
$$;

ALTER FUNCTION public.upsert_background_translation(p_id uuid, p_lang text, p_background_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_background_translation(p_id uuid, p_lang text, p_background_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_background_translation(p_id uuid, p_lang text, p_background_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_background_translation(p_id uuid, p_lang text, p_background_translation jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.update_background(
  p_id uuid,
  p_lang text,
  p_background jsonb,
  p_background_translation jsonb)
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
    p_background || jsonb_build_object('kind', 'background'::public.resource_kind),
    p_background_translation
  );

  UPDATE public.backgrounds b
  SET (
    ability_scores,
    feat_id,
    skill_proficiencies,
    tool_proficiency_id
  ) = (
    SELECT
      r.ability_scores,
      r.feat_id,
      r.skill_proficiencies,
      r.tool_proficiency_id
    FROM jsonb_populate_record(null::public.backgrounds, to_jsonb(b) || p_background) AS r
  )
  WHERE b.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  WITH entries AS (
    SELECT
      coalesce(e.choice_group, 1) AS choice_group,
      e.choice_option AS choice_option,
      e.equipment_id AS equipment_id,
      sum(coalesce(e.quantity, 1))::smallint AS quantity
    FROM jsonb_to_recordset(
      coalesce(p_background->'starting_equipment_entries', '[]'::jsonb)
    ) AS e(
      choice_group smallint,
      choice_option smallint,
      equipment_id uuid,
      quantity smallint
    )
    GROUP BY
      coalesce(e.choice_group, 1),
      e.choice_option,
      e.equipment_id
  )
  DELETE FROM public.background_starting_equipment se
  WHERE se.background_id = p_id
    AND NOT EXISTS (
      SELECT 1
      FROM entries e
      WHERE e.choice_group = se.choice_group
        AND e.choice_option = se.choice_option
        AND e.equipment_id IS NOT DISTINCT FROM se.equipment_id
        AND e.quantity = se.quantity
    );

  WITH entries AS (
    SELECT
      coalesce(e.choice_group, 1) AS choice_group,
      e.choice_option AS choice_option,
      e.equipment_id AS equipment_id,
      coalesce(e.quantity, 1) AS quantity
    FROM jsonb_to_recordset(
      coalesce(p_background->'starting_equipment_entries', '[]'::jsonb)
    ) AS e(
      choice_group smallint,
      choice_option smallint,
      equipment_id uuid,
      quantity smallint
    )
  )
  INSERT INTO public.background_starting_equipment (
    background_id,
    choice_group,
    choice_option,
    equipment_id,
    quantity
  )
  SELECT
    p_id,
    e.choice_group,
    e.choice_option,
    e.equipment_id,
    e.quantity
  FROM entries e
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.background_starting_equipment se
    WHERE se.background_id = p_id
      AND se.choice_group = e.choice_group
      AND se.choice_option = e.choice_option
      AND se.equipment_id IS NOT DISTINCT FROM e.equipment_id
      AND se.quantity = e.quantity
  );

  perform public.upsert_background_translation(p_id, p_lang, p_background_translation);
END;
$$;

ALTER FUNCTION public.update_background(p_id uuid, p_lang text, p_background jsonb, p_background_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_background(p_id uuid, p_lang text, p_background jsonb, p_background_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_background(p_id uuid, p_lang text, p_background jsonb, p_background_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_background(p_id uuid, p_lang text, p_background jsonb, p_background_translation jsonb) TO service_role;

