--------------------------------------------------------------------------------
-- ELDRITCH INVOCATION ROW
--------------------------------------------------------------------------------

CREATE TYPE public.eldritch_invocation_row AS (
  -- Resource
  id uuid,
  campaign_id uuid,
  campaign_name text,
  kind public.resource_kind,
  visibility public.campaign_role,
  -- Resource Translation
  name jsonb,
  name_short jsonb,
  page jsonb,
  -- Eldritch Invocation
  min_warlock_level smallint,
  -- Eldritch Invocation Translation
  description jsonb,
  prerequisite jsonb
);


--------------------------------------------------------------------------------
-- CREATE ELDRITCH INVOCATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_eldritch_invocation(
  p_campaign_id uuid,
  p_lang text,
  p_eldritch_invocation jsonb,
  p_eldritch_invocation_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  ei public.eldritch_invocations%ROWTYPE;
BEGIN
  ei := jsonb_populate_record(null::public.eldritch_invocations, p_eldritch_invocation);

  v_id := public.create_resource(
    p_campaign_id,
    p_lang,
    p_eldritch_invocation || jsonb_build_object('kind', 'eldritch_invocation'::public.resource_kind),
    p_eldritch_invocation_translation
  );

  INSERT INTO public.eldritch_invocations (
    resource_id, min_warlock_level
  ) VALUES (
    v_id, ei.min_warlock_level
  );

  perform public.upsert_eldritch_invocation_translation(v_id, p_lang, p_eldritch_invocation_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_eldritch_invocation(p_campaign_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_eldritch_invocation(p_campaign_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_eldritch_invocation(p_campaign_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_eldritch_invocation(p_campaign_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH ELDRITCH INVOCATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_eldritch_invocation(p_id uuid)
RETURNS public.eldritch_invocation_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    r.id,
    r.campaign_id,
    r.campaign_name,
    r.kind,
    r.visibility,
    r.name,
    r.name_short,
    r.page,
    ei.min_warlock_level,
    coalesce(tt.description, '{}'::jsonb)  AS description,
    coalesce(tt.prerequisite, '{}'::jsonb) AS prerequisite
  FROM public.fetch_resource(p_id) AS r
  JOIN public.eldritch_invocations ei ON ei.resource_id = r.id
  LEFT JOIN (
    SELECT
      ei.resource_id AS id,
      jsonb_object_agg(t.lang, t.prerequisite) AS prerequisite,
      jsonb_object_agg(t.lang, t.description)  AS description
    FROM public.eldritch_invocations ei
    LEFT JOIN public.eldritch_invocation_translations t ON t.resource_id = ei.resource_id
    WHERE ei.resource_id = p_id
    GROUP BY ei.resource_id
  ) tt ON tt.id = r.id;
$$;

ALTER FUNCTION public.fetch_eldritch_invocation(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_eldritch_invocation(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_eldritch_invocation(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_eldritch_invocation(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH ELDRITCH INVOCATIONS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_eldritch_invocations(
  p_campaign_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.eldritch_invocation_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT coalesce((p_filters->>'warlock_level')::int, 20) AS warlock_level
),
base AS (
  SELECT r.*
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'eldritch_invocation'::public.resource_kind
),
eldritch AS (
  SELECT b.*, e.min_warlock_level
  FROM base b
  JOIN public.eldritch_invocations e ON e.resource_id = b.id
),
filtered AS (
  SELECT e.*
  FROM eldritch e, prefs p
  WHERE e.min_warlock_level <= p.warlock_level
),
et AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.prerequisite) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS prerequisite,
    jsonb_object_agg(t.lang, t.description)  FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description
  FROM filtered f
  LEFT JOIN public.eldritch_invocation_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
)
SELECT
  f.id,
  f.campaign_id,
  f.campaign_name,
  f.kind,
  f.visibility,
  f.name,
  f.name_short,
  f.page,
  f.min_warlock_level,
  coalesce(et.description, '{}'::jsonb)  AS description,
  coalesce(et.prerequisite, '{}'::jsonb) AS prerequisite
FROM filtered f
LEFT JOIN et ON et.id = f.id
ORDER BY
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'asc'
      THEN (f.name->>coalesce(p_langs[1],'en'))
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'desc'
      THEN (f.name->>coalesce(p_langs[1],'en'))
  END DESC NULLS LAST;
$$;

ALTER FUNCTION public.fetch_eldritch_invocations(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_eldritch_invocations(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_eldritch_invocations(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_eldritch_invocations(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT ELDRITCH INVOCATION TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_eldritch_invocation_translation(
  p_id uuid,
  p_lang text,
  p_eldritch_invocation_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.eldritch_invocation_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.eldritch_invocation_translations, p_eldritch_invocation_translation);

  INSERT INTO public.eldritch_invocation_translations AS st (
    resource_id, lang, prerequisite, description
  ) VALUES (
    p_id, p_lang, r.prerequisite, r.description
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    prerequisite = excluded.prerequisite,
    description = excluded.description;
END;
$$;

ALTER FUNCTION public.upsert_eldritch_invocation_translation(p_id uuid, p_lang text, p_eldritch_invocation_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_eldritch_invocation_translation(p_id uuid, p_lang text, p_eldritch_invocation_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_eldritch_invocation_translation(p_id uuid, p_lang text, p_eldritch_invocation_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_eldritch_invocation_translation(p_id uuid, p_lang text, p_eldritch_invocation_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE ELDRITCH INVOCATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_eldritch_invocation(
  p_id uuid,
  p_lang text,
  p_eldritch_invocation jsonb,
  p_eldritch_invocation_translation jsonb)
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
    p_eldritch_invocation || jsonb_build_object('kind', 'eldritch_invocation'::public.resource_kind),
    p_eldritch_invocation_translation
  );

  UPDATE public.eldritch_invocations e
  SET (
    min_warlock_level
  ) = (
    SELECT ee.min_warlock_level
    FROM jsonb_populate_record(null::public.eldritch_invocations, to_jsonb(e) || p_eldritch_invocation) AS ee
  )
  WHERE e.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_eldritch_invocation_translation(p_id, p_lang, p_eldritch_invocation_translation);
END;
$$;

ALTER FUNCTION public.update_eldritch_invocation(p_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_eldritch_invocation(p_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_eldritch_invocation(p_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_eldritch_invocation(p_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) TO service_role;
