--------------------------------------------------------------------------------
-- SERVICE ROW
--------------------------------------------------------------------------------

CREATE TYPE public.service_row AS (
  -- Resource
  id uuid,
  source_id uuid,
  source_code text,
  source_version public.source_version,
  kind public.resource_kind,
  visibility public.resource_visibility,
  image_url text,
  -- Resource Translation
  name jsonb,
  name_short jsonb,
  page jsonb,
  -- Service
  category public.service_category,
  cost integer,
  cost_period public.service_cost_period,
  -- Service Translation
  availability jsonb,
  description jsonb
);


--------------------------------------------------------------------------------
-- CREATE SERVICE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_service(
  p_source_id uuid,
  p_lang text,
  p_service jsonb,
  p_service_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.services%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.services, p_service);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_service || jsonb_build_object('kind', 'service'::public.resource_kind),
    p_service_translation
  );

  INSERT INTO public.services (
    resource_id,
    category,
    cost,
    cost_period
  ) VALUES (
    v_id,
    r.category,
    r.cost,
    r.cost_period
  );

  perform public.upsert_service_translation(v_id, p_lang, p_service_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_service(p_source_id uuid, p_lang text, p_service jsonb, p_service_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_service(p_source_id uuid, p_lang text, p_service jsonb, p_service_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_service(p_source_id uuid, p_lang text, p_service jsonb, p_service_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_service(p_source_id uuid, p_lang text, p_service jsonb, p_service_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH SERVICE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_service(p_id uuid)
RETURNS public.service_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    r.id,
    r.source_id,
    r.source_code,
    r.source_version,
    r.kind,
    r.visibility,
    r.image_url,
    r.name,
    r.name_short,
    r.page,
    s.category,
    s.cost,
    s.cost_period,
    coalesce(tt.availability, '{}'::jsonb) AS availability,
    coalesce(tt.description, '{}'::jsonb)  AS description
  FROM public.fetch_resource(p_id) AS r
  JOIN public.services s ON s.resource_id = r.id
  LEFT JOIN (
    SELECT
      s.resource_id AS id,
      jsonb_object_agg(t.lang, t.availability) AS availability,
      jsonb_object_agg(t.lang, t.description)  AS description
    FROM public.services s
    LEFT JOIN public.service_translations t ON t.resource_id = s.resource_id
    WHERE s.resource_id = p_id
    GROUP BY s.resource_id
  ) tt ON tt.id = r.id;
$$;

ALTER FUNCTION public.fetch_service(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_service(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_service(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_service(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH SERVICES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_services(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.service_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    (
      SELECT coalesce(array_agg((e.key)::public.service_category), null)
      FROM jsonb_each_text(p_filters->'categories') AS e(key, value)
      WHERE e.value = 'true'
    ) AS categories_inc,
    (
      SELECT coalesce(array_agg((e.key)::public.service_category), null)
      FROM jsonb_each_text(p_filters->'categories') AS e(key, value)
      WHERE e.value = 'false'
    ) AS categories_exc
),
base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'service'::public.resource_kind
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
    s.category,
    s.cost,
    s.cost_period
  FROM base b
  JOIN public.services s ON s.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
        (p.categories_inc IS NULL OR s.category = any(p.categories_inc))
    AND (p.categories_exc IS NULL OR NOT (s.category = any(p.categories_exc)))
),
st AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.availability) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS availability,
    jsonb_object_agg(t.lang, t.description)  FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description
  FROM filtered f
  LEFT JOIN public.service_translations t ON t.resource_id = f.id
  GROUP BY f.id
)
SELECT
  s.id,
  s.source_id,
  s.source_code,
  s.source_version,
  s.kind,
  s.visibility,
  s.image_url,
  s.name,
  s.name_short,
  s.page,
  s.category,
  s.cost,
  s.cost_period,
  coalesce(st.availability, '{}'::jsonb) AS availability,
  coalesce(st.description, '{}'::jsonb)  AS description
FROM filtered s
LEFT JOIN st ON st.id = s.id
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

ALTER FUNCTION public.fetch_services(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_services(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_services(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_services(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT SERVICE TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_service_translation(
  p_id uuid,
  p_lang text,
  p_service_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.service_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.service_translations, p_service_translation);

  INSERT INTO public.service_translations AS st (
    resource_id, lang, availability, description
  ) VALUES (
    p_id, p_lang, r.availability, r.description
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    availability = excluded.availability,
    description = excluded.description;
END;
$$;

ALTER FUNCTION public.upsert_service_translation(p_id uuid, p_lang text, p_service_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_service_translation(p_id uuid, p_lang text, p_service_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_service_translation(p_id uuid, p_lang text, p_service_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_service_translation(p_id uuid, p_lang text, p_service_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE SERVICE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_service(
  p_id uuid,
  p_lang text,
  p_service jsonb,
  p_service_translation jsonb)
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
    p_service || jsonb_build_object('kind', 'service'::public.resource_kind),
    p_service_translation
  );

  UPDATE public.services s
  SET
    category = r.category,
    cost = r.cost,
    cost_period = r.cost_period
  FROM jsonb_populate_record(null::public.services, p_service) AS r
  WHERE s.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_service_translation(p_id, p_lang, p_service_translation);
END;
$$;

ALTER FUNCTION public.update_service(p_id uuid, p_lang text, p_service jsonb, p_service_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_service(p_id uuid, p_lang text, p_service jsonb, p_service_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_service(p_id uuid, p_lang text, p_service jsonb, p_service_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_service(p_id uuid, p_lang text, p_service jsonb, p_service_translation jsonb) TO service_role;
