--------------------------------------------------------------------------------
-- PRESERVE FEATURE GRANT POSITIONS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_feature(
  p_source_id uuid,
  p_lang text,
  p_feature jsonb,
  p_feature_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
BEGIN
  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_feature || jsonb_build_object('kind', 'feature'::public.resource_kind),
    p_feature_translation
  );

  INSERT INTO public.features (
    resource_id
  ) VALUES (
    v_id
  );

  INSERT INTO public.resource_features (
    resource_id,
    feature_id,
    min_level,
    position
  )
  SELECT
    g.resource_id,
    v_id,
    g.min_level,
    (coalesce(mp.position, -1) + g.position_offset + 1)::smallint
  FROM (
    SELECT
      (a.value->>'id')::uuid AS resource_id,
      coalesce((a.value->>'min_level')::smallint, 0) AS min_level,
      (row_number() OVER (
        PARTITION BY (a.value->>'id')::uuid
        ORDER BY a.ordinality
      ) - 1)::smallint AS position_offset
    FROM jsonb_array_elements(coalesce(p_feature->'granted_by', '[]'::jsonb)) WITH ORDINALITY AS a(value, ordinality)
  ) g
  LEFT JOIN (
    SELECT
      rf.resource_id,
      max(rf.position) AS position
    FROM public.resource_features rf
    GROUP BY rf.resource_id
  ) mp ON mp.resource_id = g.resource_id;

  perform public.upsert_feature_translation(v_id, p_lang, p_feature_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_feature(p_source_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_feature(p_source_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_feature(p_source_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_feature(p_source_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) TO service_role;


CREATE OR REPLACE FUNCTION public.update_feature(
  p_id uuid,
  p_lang text,
  p_feature jsonb,
  p_feature_translation jsonb)
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
    p_feature || jsonb_build_object('kind', 'feature'::public.resource_kind),
    p_feature_translation
  );

  UPDATE public.features f
  SET resource_id = f.resource_id
  WHERE f.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  IF p_feature ? 'granted_by' THEN
    DELETE FROM public.resource_features rf
    WHERE rf.feature_id = p_id
      AND NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements(coalesce(p_feature->'granted_by', '[]'::jsonb)) AS a(value)
        WHERE (a.value->>'id')::uuid = rf.resource_id
          AND coalesce((a.value->>'min_level')::smallint, 0) = rf.min_level
      );

    INSERT INTO public.resource_features (
      resource_id,
      feature_id,
      min_level,
      position
    )
    SELECT
      g.resource_id,
      p_id,
      g.min_level,
      (coalesce(mp.position, -1) + g.position_offset + 1)::smallint
    FROM (
      SELECT
        n.resource_id,
        n.min_level,
        (row_number() OVER (
          PARTITION BY n.resource_id
          ORDER BY n.ordinality
        ) - 1)::smallint AS position_offset
      FROM (
        SELECT
          (a.value->>'id')::uuid AS resource_id,
          coalesce((a.value->>'min_level')::smallint, 0) AS min_level,
          a.ordinality
        FROM jsonb_array_elements(coalesce(p_feature->'granted_by', '[]'::jsonb)) WITH ORDINALITY AS a(value, ordinality)
      ) n
      WHERE NOT EXISTS (
        SELECT 1
        FROM public.resource_features rf
        WHERE rf.resource_id = n.resource_id
          AND rf.feature_id = p_id
          AND rf.min_level = n.min_level
      )
    ) g
    LEFT JOIN (
      SELECT
        rf.resource_id,
        max(rf.position) AS position
      FROM public.resource_features rf
      GROUP BY rf.resource_id
    ) mp ON mp.resource_id = g.resource_id;
  END IF;

  perform public.upsert_feature_translation(p_id, p_lang, p_feature_translation);
END;
$$;

ALTER FUNCTION public.update_feature(p_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_feature(p_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_feature(p_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_feature(p_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) TO service_role;
