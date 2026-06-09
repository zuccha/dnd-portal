--------------------------------------------------------------------------------
-- FEATURES
--------------------------------------------------------------------------------

CREATE TABLE public.features (
  resource_id uuid NOT NULL,
  CONSTRAINT features_pkey PRIMARY KEY (resource_id),
  CONSTRAINT features_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.features OWNER TO postgres;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.features TO anon;
GRANT ALL ON TABLE public.features TO authenticated;
GRANT ALL ON TABLE public.features TO service_role;


--------------------------------------------------------------------------------
-- FEATURE TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE public.feature_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  description text DEFAULT ''::text NOT NULL,
  CONSTRAINT feature_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT feature_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.features(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT feature_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.feature_translations OWNER TO postgres;
ALTER TABLE public.feature_translations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_feature_translations_lang ON public.feature_translations USING btree (lang);

GRANT ALL ON TABLE public.feature_translations TO anon;
GRANT ALL ON TABLE public.feature_translations TO authenticated;
GRANT ALL ON TABLE public.feature_translations TO service_role;


--------------------------------------------------------------------------------
-- RESOURCE FEATURES
--------------------------------------------------------------------------------

CREATE TABLE public.resource_features (
  resource_id uuid NOT NULL,
  feature_id uuid NOT NULL,
  min_level smallint DEFAULT 0 NOT NULL,
  position smallint NOT NULL,
  CONSTRAINT resource_features_pkey PRIMARY KEY (resource_id, feature_id, min_level),
  CONSTRAINT resource_features_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT resource_features_feature_id_fkey FOREIGN KEY (feature_id) REFERENCES public.features(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT resource_features_min_level_check CHECK (((min_level >= 0) AND (min_level <= 20))),
  CONSTRAINT resource_features_position_check CHECK (position >= 0)
);

ALTER TABLE public.resource_features OWNER TO postgres;
ALTER TABLE public.resource_features ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.resource_features TO anon;
GRANT ALL ON TABLE public.resource_features TO authenticated;
GRANT ALL ON TABLE public.resource_features TO service_role;

CREATE INDEX idx_resource_features_resource_id ON public.resource_features USING btree (resource_id);
CREATE INDEX idx_resource_features_feature_id ON public.resource_features USING btree (feature_id);


--------------------------------------------------------------------------------
-- FEATURE RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_feature_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'feature'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a feature', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_feature_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_feature_resource_kind
  BEFORE INSERT OR UPDATE ON public.features
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_feature_resource_kind();

GRANT ALL ON FUNCTION public.validate_feature_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_feature_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_feature_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- RESOURCE FEATURES RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_resource_features_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind IN (
        'character_class'::public.resource_kind,
        'character_subclass'::public.resource_kind,
        'species'::public.resource_kind,
        'feat'::public.resource_kind,
        'equipment'::public.resource_kind,
        'armor'::public.resource_kind,
        'weapon'::public.resource_kind,
        'tool'::public.resource_kind,
        'item'::public.resource_kind
      )
  ) THEN
    RAISE EXCEPTION 'Resource % cannot grant features', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_resource_features_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_resource_features_resource_kind
  BEFORE INSERT OR UPDATE ON public.resource_features
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_resource_features_resource_kind();

GRANT ALL ON FUNCTION public.validate_resource_features_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_resource_features_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_resource_features_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- RESOURCE FEATURE ENTRIES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_resource_feature_entries(p_resource_id uuid)
RETURNS jsonb
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', rf.feature_id,
        'min_level', rf.min_level
      )
      ORDER BY rf.position, rf.feature_id
    ),
    '[]'::jsonb
  )
  FROM public.resource_features rf
  WHERE rf.resource_id = p_resource_id;
$$;

ALTER FUNCTION public.fetch_resource_feature_entries(p_resource_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_resource_feature_entries(p_resource_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_resource_feature_entries(p_resource_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_resource_feature_entries(p_resource_id uuid) TO service_role;


CREATE OR REPLACE FUNCTION public.replace_resource_feature_entries(
  p_resource_id uuid,
  p_feature_entries jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  DELETE FROM public.resource_features rf
  WHERE rf.resource_id = p_resource_id;

  INSERT INTO public.resource_features (
    resource_id,
    feature_id,
    min_level,
    position
  )
  SELECT
    p_resource_id,
    (e.value->>'id')::uuid,
    coalesce((e.value->>'min_level')::smallint, 0),
    (e.ordinality - 1)::smallint
  FROM jsonb_array_elements(coalesce(p_feature_entries, '[]'::jsonb)) WITH ORDINALITY AS e(value, ordinality);
END;
$$;

ALTER FUNCTION public.replace_resource_feature_entries(p_resource_id uuid, p_feature_entries jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.replace_resource_feature_entries(p_resource_id uuid, p_feature_entries jsonb) TO anon;
GRANT ALL ON FUNCTION public.replace_resource_feature_entries(p_resource_id uuid, p_feature_entries jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.replace_resource_feature_entries(p_resource_id uuid, p_feature_entries jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FEATURES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read features"
ON public.features
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new features"
ON public.features
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update features"
ON public.features
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete features"
ON public.features
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- FEATURE TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read feature translations"
ON public.feature_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new feature translations"
ON public.feature_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update feature translations"
ON public.feature_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete feature translations"
ON public.feature_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- RESOURCE FEATURES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read resource features"
ON public.resource_features
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id) AND public.can_read_resource(feature_id));

CREATE POLICY "Creators and GMs can create resource features"
ON public.resource_features
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id) AND public.can_read_resource(feature_id));

CREATE POLICY "Creators and GMs can update resource features"
ON public.resource_features
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id) AND public.can_read_resource(feature_id));

CREATE POLICY "Creators and GMs can delete resource features"
ON public.resource_features
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- FEATURE ROW
--------------------------------------------------------------------------------

CREATE TYPE public.feature_row AS (
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
  description jsonb,
  granted_by jsonb
);


--------------------------------------------------------------------------------
-- CREATE FEATURE
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
    (a.value->>'id')::uuid,
    v_id,
    coalesce((a.value->>'min_level')::smallint, 0),
    coalesce((a.value->>'position')::smallint, (a.ordinality - 1)::smallint)
  FROM jsonb_array_elements(coalesce(p_feature->'granted_by', '[]'::jsonb)) WITH ORDINALITY AS a(value, ordinality);

  perform public.upsert_feature_translation(v_id, p_lang, p_feature_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_feature(p_source_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_feature(p_source_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_feature(p_source_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_feature(p_source_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH FEATURE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_feature(p_id uuid)
RETURNS public.feature_row
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
    coalesce(tt.description, '{}'::jsonb) AS description,
    coalesce(g.granted_by, '[]'::jsonb) AS granted_by
  FROM public.fetch_resource(p_id) AS r
  JOIN public.features f ON f.resource_id = r.id
  LEFT JOIN (
    SELECT
      f.resource_id AS id,
      jsonb_object_agg(t.lang, t.description) AS description
    FROM public.features f
    LEFT JOIN public.feature_translations t ON t.resource_id = f.resource_id
    WHERE f.resource_id = p_id
    GROUP BY f.resource_id
  ) tt ON tt.id = r.id
  LEFT JOIN (
    SELECT
      rf.feature_id AS id,
      jsonb_agg(
        jsonb_build_object(
          'id', rf.resource_id,
          'min_level', rf.min_level
        )
        ORDER BY rf.position, rf.resource_id
      ) AS granted_by
    FROM public.resource_features rf
    WHERE rf.feature_id = p_id
    GROUP BY rf.feature_id
  ) g ON g.id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_feature(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_feature(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_feature(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_feature(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH FEATURES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_features(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.feature_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'feature'::public.resource_kind
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
    b.page
  FROM base b
  JOIN public.features f ON f.resource_id = b.id
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.description) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description
  FROM src f
  LEFT JOIN public.feature_translations t ON t.resource_id = f.id
  GROUP BY f.id
),
g AS (
  SELECT
    rf.feature_id AS id,
    jsonb_agg(
      jsonb_build_object(
        'id', rf.resource_id,
        'min_level', rf.min_level
      )
      ORDER BY rf.position, rf.resource_id
    ) AS granted_by
  FROM public.resource_features rf
  GROUP BY rf.feature_id
)
SELECT
  f.source_id,
  f.source_code,
  f.source_version,
  f.id,
  f.kind,
  f.visibility,
  f.image_url,
  f.name,
  f.name_short,
  f.page,
  coalesce(tt.description, '{}'::jsonb) AS description,
  coalesce(g.granted_by, '[]'::jsonb) AS granted_by
FROM src f
LEFT JOIN t tt ON tt.id = f.id
LEFT JOIN g ON g.id = f.id
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

ALTER FUNCTION public.fetch_features(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_features(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_features(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_features(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT FEATURE TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_feature_translation(
  p_id uuid,
  p_lang text,
  p_feature_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.feature_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.feature_translations, p_feature_translation);

  INSERT INTO public.feature_translations AS ft (
    resource_id, lang, description
  ) VALUES (
    p_id, p_lang, r.description
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    description = excluded.description;

  perform public.upsert_resource_translation(p_id, p_lang, p_feature_translation);
END;
$$;

ALTER FUNCTION public.upsert_feature_translation(p_id uuid, p_lang text, p_feature_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_feature_translation(p_id uuid, p_lang text, p_feature_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_feature_translation(p_id uuid, p_lang text, p_feature_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_feature_translation(p_id uuid, p_lang text, p_feature_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE FEATURE
--------------------------------------------------------------------------------

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
    WHERE rf.feature_id = p_id;

    INSERT INTO public.resource_features (
      resource_id,
      feature_id,
      min_level,
      position
    )
    SELECT
      (a.value->>'id')::uuid,
      p_id,
      coalesce((a.value->>'min_level')::smallint, 0),
      coalesce((a.value->>'position')::smallint, (a.ordinality - 1)::smallint)
    FROM jsonb_array_elements(coalesce(p_feature->'granted_by', '[]'::jsonb)) WITH ORDINALITY AS a(value, ordinality);
  END IF;

  perform public.upsert_feature_translation(p_id, p_lang, p_feature_translation);
END;
$$;

ALTER FUNCTION public.update_feature(p_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_feature(p_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_feature(p_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_feature(p_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) TO service_role;
