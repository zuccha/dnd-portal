CREATE TABLE IF NOT EXISTS public.feats (
  resource_id uuid NOT NULL,
  category public.feat_category NOT NULL,
  min_level smallint NOT NULL,
  CONSTRAINT feats_pkey PRIMARY KEY (resource_id),
  CONSTRAINT feats_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT feats_min_level_check CHECK (((min_level >= 0) AND (min_level <= 20)))
);

ALTER TABLE public.feats OWNER TO postgres;
ALTER TABLE public.feats ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.feat_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  prerequisite text DEFAULT ''::text NOT NULL,
  description text DEFAULT ''::text NOT NULL,
  CONSTRAINT feat_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT feat_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.feats(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT feat_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.feat_translations OWNER TO postgres;
ALTER TABLE public.feat_translations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_feat_translations_lang ON public.feat_translations USING btree (lang);

CREATE TYPE public.feat_row AS (
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
  category public.feat_category,
  min_level smallint,
  prerequisite jsonb,
  description jsonb
);

CREATE OR REPLACE FUNCTION public.create_feat(
  p_source_id uuid,
  p_lang text,
  p_feat jsonb,
  p_feat_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.feats%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.feats, p_feat);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_feat || jsonb_build_object('kind', 'feat'::public.resource_kind),
    p_feat_translation
  );

  INSERT INTO public.feats (
    resource_id, category, min_level
  ) VALUES (
    v_id, r.category, r.min_level
  );

  perform public.upsert_feat_translation(v_id, p_lang, p_feat_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_feat(p_source_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.fetch_feat(p_id uuid)
RETURNS public.feat_row
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
    f.category,
    f.min_level,
    coalesce(tt.prerequisite, '{}'::jsonb) AS prerequisite,
    coalesce(tt.description, '{}'::jsonb) AS description
  FROM public.fetch_resource(p_id) AS r
  JOIN public.feats f ON f.resource_id = r.id
  LEFT JOIN (
    SELECT
      f.resource_id AS id,
      jsonb_object_agg(t.lang, t.prerequisite) AS prerequisite,
      jsonb_object_agg(t.lang, t.description) AS description
    FROM public.feats f
    LEFT JOIN public.feat_translations t ON t.resource_id = f.resource_id
    WHERE f.resource_id = p_id
    GROUP BY f.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_feat(p_id uuid) OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.fetch_feats(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.feat_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    coalesce((p_filters->>'level')::int, 20) AS level,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.feat_category), null)
      FROM jsonb_each_text(p_filters->'categories') AS e(key, value)
      WHERE e.value = 'true'
    ) AS categories_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.feat_category), null)
      FROM jsonb_each_text(p_filters->'categories') AS e(key, value)
      WHERE e.value = 'false'
    ) AS categories_exc
),
base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'feat'::public.resource_kind
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
    f.category,
    f.min_level
  FROM base b
  JOIN public.feats f ON f.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
    s.min_level <= p.level
    AND (p.categories_inc IS NULL OR s.category = any(p.categories_inc))
    AND (p.categories_exc IS NULL OR NOT (s.category = any(p.categories_exc)))
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.prerequisite) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS prerequisite,
    jsonb_object_agg(t.lang, t.description) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description
  FROM filtered f
  LEFT JOIN public.feat_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true
  GROUP BY f.id
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
  f.category,
  f.min_level,
  coalesce(tt.prerequisite, '{}'::jsonb) AS prerequisite,
  coalesce(tt.description, '{}'::jsonb) AS description
FROM filtered f
LEFT JOIN t tt ON tt.id = f.id
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

ALTER FUNCTION public.fetch_feats(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.upsert_feat_translation(
  p_id uuid,
  p_lang text,
  p_feat_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.feat_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.feat_translations, p_feat_translation);

  INSERT INTO public.feat_translations AS ft (
    resource_id, lang, prerequisite, description
  ) VALUES (
    p_id, p_lang, r.prerequisite, r.description
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    prerequisite = excluded.prerequisite,
    description = excluded.description;

  perform public.upsert_resource_translation(p_id, p_lang, p_feat_translation);
END;
$$;

ALTER FUNCTION public.upsert_feat_translation(p_id uuid, p_lang text, p_feat_translation jsonb) OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.update_feat(
  p_id uuid,
  p_lang text,
  p_feat jsonb,
  p_feat_translation jsonb)
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
    p_feat || jsonb_build_object('kind', 'feat'::public.resource_kind),
    p_feat_translation
  );

  UPDATE public.feats f
  SET (
    category,
    min_level
  ) = (
    SELECT r.category, r.min_level
    FROM jsonb_populate_record(null::public.feats, to_jsonb(f) || p_feat) AS r
  )
  WHERE f.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_feat_translation(p_id, p_lang, p_feat_translation);
END;
$$;

ALTER FUNCTION public.update_feat(p_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.validate_feat_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'feat'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a feat', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_feat_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_feat_resource_kind
  BEFORE INSERT OR UPDATE ON public.feats
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_feat_resource_kind();

GRANT ALL ON TABLE public.feats TO anon;
GRANT ALL ON TABLE public.feats TO authenticated;
GRANT ALL ON TABLE public.feats TO service_role;
GRANT ALL ON TABLE public.feat_translations TO anon;
GRANT ALL ON TABLE public.feat_translations TO authenticated;
GRANT ALL ON TABLE public.feat_translations TO service_role;
GRANT ALL ON FUNCTION public.create_feat(p_source_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_feat(p_source_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_feat(p_source_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) TO service_role;
GRANT ALL ON FUNCTION public.fetch_feat(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_feat(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_feat(p_id uuid) TO service_role;
GRANT ALL ON FUNCTION public.fetch_feats(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_feats(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_feats(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;
GRANT ALL ON FUNCTION public.upsert_feat_translation(p_id uuid, p_lang text, p_feat_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_feat_translation(p_id uuid, p_lang text, p_feat_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_feat_translation(p_id uuid, p_lang text, p_feat_translation jsonb) TO service_role;
GRANT ALL ON FUNCTION public.update_feat(p_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_feat(p_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_feat(p_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) TO service_role;
GRANT ALL ON FUNCTION public.validate_feat_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_feat_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_feat_resource_kind() TO service_role;

CREATE POLICY "Users can read feats"
ON public.feats
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new feats"
ON public.feats
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update feats"
ON public.feats
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete feats"
ON public.feats
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE POLICY "Users can read feat translations"
ON public.feat_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new feat translations"
ON public.feat_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update feat translations"
ON public.feat_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete feat translations"
ON public.feat_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));
