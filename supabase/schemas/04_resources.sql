--------------------------------------------------------------------------------
-- RESOURCES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.resources (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  source_id uuid,
  visibility public.resource_visibility DEFAULT 'private'::public.resource_visibility NOT NULL,
  kind public.resource_kind NOT NULL,
  image_url text,
  CONSTRAINT resources_pkey PRIMARY KEY (id),
  CONSTRAINT resources_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.sources(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.resources OWNER TO postgres;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.resources TO anon;
GRANT ALL ON TABLE public.resources TO authenticated;
GRANT ALL ON TABLE public.resources TO service_role;


--------------------------------------------------------------------------------
-- RESOURCE TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.resource_translations (
  resource_id uuid DEFAULT gen_random_uuid() NOT NULL,
  lang text NOT NULL,
  name text DEFAULT ''::text NOT NULL,
  name_short text DEFAULT ''::text NOT NULL,
  page smallint,
  CONSTRAINT resource_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT resource_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT resource_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.resource_translations OWNER TO postgres;
ALTER TABLE public.resource_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.resource_translations TO anon;
GRANT ALL ON TABLE public.resource_translations TO authenticated;
GRANT ALL ON TABLE public.resource_translations TO service_role;


--------------------------------------------------------------------------------
-- RESOURCE ROW
--------------------------------------------------------------------------------

CREATE TYPE public.resource_row AS (
  id uuid,
  source_id uuid,
  source_code text,
  kind public.resource_kind,
  visibility public.resource_visibility,
  image_url text,
  name jsonb,
  name_short jsonb,
  page jsonb
);


--------------------------------------------------------------------------------
-- CAN READ RESOURCE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_read_resource(p_resource_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = p_resource_id
      AND (
        public.can_edit_source_resources(r.source_id)
        OR (
          r.visibility = 'public'::public.resource_visibility
          AND public.can_read_source(r.source_id)
        )
      )
  );
$$;

ALTER FUNCTION public.can_read_resource(p_resource_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_read_resource(p_resource_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_read_resource(p_resource_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_read_resource(p_resource_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- CAN EDIT RESOURCE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_edit_resource(p_resource_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = p_resource_id
      AND public.can_edit_source_resources(r.source_id)
  );
$$;

ALTER FUNCTION public.can_edit_resource(p_resource_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_edit_resource(p_resource_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_edit_resource(p_resource_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_edit_resource(p_resource_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- CAN CREATE RESOURCE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_create_resource(p_source_id uuid)
RETURNS boolean
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT public.can_edit_source_resources(p_source_id);
$$;

ALTER FUNCTION public.can_create_resource(p_source_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_create_resource(p_source_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_create_resource(p_source_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_create_resource(p_source_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- RESOURCES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read resources"
ON public.resources
FOR SELECT TO anon, authenticated
USING (
  public.can_read_resource(id)
  OR public.can_edit_resource(id)
  OR public.can_create_resource(source_id)
);

CREATE POLICY "Creators and GMs can create new resources"
ON public.resources
FOR INSERT TO authenticated
WITH CHECK (public.can_create_resource(source_id));

CREATE POLICY "Creators and GMs can update resources"
ON public.resources
FOR UPDATE TO authenticated
USING (public.can_edit_resource(id))
WITH CHECK (public.can_edit_resource(id));

CREATE POLICY "Creators and GMs can delete resources"
ON public.resources
FOR DELETE TO authenticated
USING (public.can_edit_resource(id));


--------------------------------------------------------------------------------
-- RESOURCE TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read resource translations"
ON public.resource_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new resource translations"
ON public.resource_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update resource translations"
ON public.resource_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete resource translations"
ON public.resource_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- CREATE RESOURCE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_resource(
  p_source_id uuid,
  p_lang text,
  p_resource jsonb,
  p_resource_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.resources%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.resources, p_resource);

  INSERT INTO public.resources (
    source_id, visibility, kind, image_url
  ) VALUES (
    p_source_id, r.visibility, r.kind, r.image_url
  )
  RETURNING id INTO v_id;

  perform public.upsert_resource_translation(v_id, p_lang, p_resource_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_resource(p_source_id uuid, p_lang text, p_resource jsonb, p_resource_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_resource(p_source_id uuid, p_lang text, p_resource jsonb, p_resource_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_resource(p_source_id uuid, p_lang text, p_resource jsonb, p_resource_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_resource(p_source_id uuid, p_lang text, p_resource jsonb, p_resource_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH RESOURCE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_resource(p_id uuid)
RETURNS public.resource_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    r.id,
    r.source_id,
    s.code                          AS source_code,
    r.kind,
    r.visibility,
    r.image_url,
    coalesce(tt.name, '{}'::jsonb)  AS name,
    coalesce(tt.name_short, '{}'::jsonb) AS name_short,
    coalesce(tt.page, '{}'::jsonb)  AS page
  FROM public.resources r
  LEFT JOIN public.sources s ON s.id = r.source_id
  LEFT JOIN (
    SELECT
      r.id,
      jsonb_object_agg(t.lang, t.name) AS name,
      jsonb_object_agg(t.lang, t.name_short) AS name_short,
      jsonb_object_agg(t.lang, t.page) AS page
    FROM public.resources r
    LEFT JOIN public.resource_translations t ON t.resource_id = r.id
    WHERE r.id = p_id
    GROUP BY r.id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_resource(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_resource(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_resource(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_resource(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH RESOURCES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_resources(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.resource_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    -- sources include/exclude filter (keys are source ids)
    coalesce(p_filters->'sources', '{}'::jsonb) AS source_filter,

    -- kinds
    (
      SELECT coalesce(array_agg(lower(e.key)::public.resource_kind), null)
      FROM jsonb_each_text(p_filters->'kinds') AS e(key, value)
      WHERE e.value = 'true'
    ) AS kinds_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.resource_kind), null)
      FROM jsonb_each_text(p_filters->'kinds') AS e(key, value)
      WHERE e.value = 'false'
    ) AS kinds_exc
),
src AS (
  SELECT r.*
  FROM public.resources r
  JOIN prefs p ON true
  JOIN public.source_resource_ids_with_deps(p_source_id, p.source_filter) si ON si.id = r.source_id
  LEFT JOIN public.sources s ON s.id = r.source_id
),
filtered AS (
  SELECT r.*
  FROM src r, prefs p
  WHERE
    (p.kinds_inc IS NULL OR r.kind = any(p.kinds_inc))
    AND (p.kinds_exc IS NULL OR NOT (r.kind = any(p.kinds_exc)))
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.name) AS name,
    jsonb_object_agg(t.lang, t.name_short) AS name_short,
    jsonb_object_agg(t.lang, t.page) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS page
  FROM filtered f
  LEFT JOIN public.resource_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
)
SELECT
  f.id,
  f.source_id,
  s.code                        AS source_code,
  f.kind,
  f.visibility,
  f.image_url,
  coalesce(tt.name, '{}'::jsonb) AS name,
  coalesce(tt.name_short, '{}'::jsonb) AS name_short,
  coalesce(tt.page, '{}'::jsonb) AS page
FROM filtered f
LEFT JOIN public.sources s ON s.id = f.source_id
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

ALTER FUNCTION public.fetch_resources(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_resources(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_resources(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_resources(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- FETCH RESOURCE LOOKUPS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_resource_lookups(
  p_source_id uuid,
  p_resource_kinds public.resource_kind[])
RETURNS TABLE(id uuid, name jsonb, name_short jsonb)
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  WITH source_ids AS (
    SELECT id
    FROM public.source_resource_ids_with_deps(p_source_id, '{}'::jsonb)
  )
  SELECT
    r.id,
    coalesce(tt.name, '{}'::jsonb) AS name,
    coalesce(tt.name_short, '{}'::jsonb) AS name_short
  FROM public.resources r
  JOIN source_ids sids ON sids.id = r.source_id
  LEFT JOIN (
    SELECT
      rt.resource_id AS id,
      jsonb_object_agg(rt.lang, rt.name) AS name,
      jsonb_object_agg(rt.lang, rt.name_short) AS name_short
    FROM public.resource_translations rt
    GROUP BY rt.resource_id
  ) tt ON tt.id = r.id
  WHERE r.kind = any(p_resource_kinds)
  ORDER BY r.id;
$$;

ALTER FUNCTION public.fetch_resource_lookups(p_source_id uuid, p_resource_kinds public.resource_kind[]) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_resource_lookups(p_source_id uuid, p_resource_kinds public.resource_kind[]) TO anon;
GRANT ALL ON FUNCTION public.fetch_resource_lookups(p_source_id uuid, p_resource_kinds public.resource_kind[]) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_resource_lookups(p_source_id uuid, p_resource_kinds public.resource_kind[]) TO service_role;


--------------------------------------------------------------------------------
-- FETCH RESOURCE LOOKUP
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_resource_lookup(p_id uuid)
RETURNS TABLE(id uuid, name jsonb, name_short jsonb)
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    r.id,
    coalesce(tt.name, '{}'::jsonb) AS name,
    coalesce(tt.name_short, '{}'::jsonb) AS name_short
  FROM public.resources r
  LEFT JOIN (
    SELECT
      rt.resource_id AS id,
      jsonb_object_agg(rt.lang, rt.name) AS name,
      jsonb_object_agg(rt.lang, rt.name_short) AS name_short
    FROM public.resource_translations rt
    WHERE rt.resource_id = p_id
    GROUP BY rt.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_resource_lookup(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_resource_lookup(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_resource_lookup(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_resource_lookup(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT RESOURCE TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_resource_translation(
  p_id uuid,
  p_lang text,
  p_resource_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.resource_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.resource_translations, p_resource_translation);

  INSERT INTO public.resource_translations AS rt (
    resource_id, lang, name, name_short, page
  ) VALUES (
    p_id, p_lang, r.name, r.name_short, r.page
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    name = excluded.name,
    name_short = excluded.name_short,
    page = excluded.page;
END;
$$;

ALTER FUNCTION public.upsert_resource_translation(p_id uuid, p_lang text, p_resource_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_resource_translation(p_id uuid, p_lang text, p_resource_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_resource_translation(p_id uuid, p_lang text, p_resource_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_resource_translation(p_id uuid, p_lang text, p_resource_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE RESOURCE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_resource(
  p_id uuid,
  p_lang text,
  p_resource jsonb,
  p_resource_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_rows int;
BEGIN
  UPDATE public.resources r
  SET (
    visibility, kind, image_url, source_id
  ) = (
    SELECT rr.visibility, rr.kind, rr.image_url, rr.source_id
    FROM jsonb_populate_record(null::public.resources, to_jsonb(r) || p_resource) AS rr
  )
  WHERE r.id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_resource_translation(p_id, p_lang, p_resource_translation);
END;
$$;

ALTER FUNCTION public.update_resource(p_id uuid, p_lang text, p_resource jsonb, p_resource_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_resource(p_id uuid, p_lang text, p_resource jsonb, p_resource_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_resource(p_id uuid, p_lang text, p_resource jsonb, p_resource_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_resource(p_id uuid, p_lang text, p_resource jsonb, p_resource_translation jsonb) TO service_role;
