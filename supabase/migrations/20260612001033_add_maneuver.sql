CREATE TABLE IF NOT EXISTS public.maneuvers (
  resource_id uuid NOT NULL,
  CONSTRAINT maneuvers_pkey PRIMARY KEY (resource_id),
  CONSTRAINT maneuvers_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.maneuvers OWNER TO postgres;
ALTER TABLE public.maneuvers ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.maneuvers TO anon;
GRANT ALL ON TABLE public.maneuvers TO authenticated;
GRANT ALL ON TABLE public.maneuvers TO service_role;

CREATE TABLE IF NOT EXISTS public.maneuver_translations (
  resource_id uuid NOT NULL,
  lang text DEFAULT ''::text NOT NULL,
  prerequisite text DEFAULT ''::text NOT NULL,
  description text DEFAULT ''::text NOT NULL,
  CONSTRAINT maneuver_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT maneuver_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.maneuvers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT maneuver_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.maneuver_translations OWNER TO postgres;
ALTER TABLE public.maneuver_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.maneuver_translations TO anon;
GRANT ALL ON TABLE public.maneuver_translations TO authenticated;
GRANT ALL ON TABLE public.maneuver_translations TO service_role;

CREATE OR REPLACE FUNCTION public.validate_maneuver_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'maneuver'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a maneuver', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_maneuver_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_maneuver_resource_kind
  BEFORE INSERT OR UPDATE ON public.maneuvers
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_maneuver_resource_kind();

GRANT ALL ON FUNCTION public.validate_maneuver_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_maneuver_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_maneuver_resource_kind() TO service_role;

CREATE POLICY "Users can read maneuvers"
ON public.maneuvers
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new maneuvers"
ON public.maneuvers
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update maneuvers"
ON public.maneuvers
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete maneuvers"
ON public.maneuvers
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE POLICY "Users can read maneuver translations"
ON public.maneuver_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new maneuver translations"
ON public.maneuver_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update maneuver translations"
ON public.maneuver_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete maneuver translations"
ON public.maneuver_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE TYPE public.maneuver_row AS (
  id uuid,
  source_id uuid,
  source_code text,
  source_version public.source_version,
  kind public.resource_kind,
  visibility public.resource_visibility,
  image_url text,
  name jsonb,
  name_short jsonb,
  page jsonb,
  description jsonb,
  prerequisite jsonb
);

CREATE OR REPLACE FUNCTION public.create_maneuver(
  p_source_id uuid,
  p_lang text,
  p_maneuver jsonb,
  p_maneuver_translation jsonb)
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
    p_maneuver || jsonb_build_object('kind', 'maneuver'::public.resource_kind),
    p_maneuver_translation
  );

  INSERT INTO public.maneuvers (
    resource_id
  ) VALUES (
    v_id
  );

  perform public.upsert_maneuver_translation(v_id, p_lang, p_maneuver_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_maneuver(p_source_id uuid, p_lang text, p_maneuver jsonb, p_maneuver_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_maneuver(p_source_id uuid, p_lang text, p_maneuver jsonb, p_maneuver_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_maneuver(p_source_id uuid, p_lang text, p_maneuver jsonb, p_maneuver_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_maneuver(p_source_id uuid, p_lang text, p_maneuver jsonb, p_maneuver_translation jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.fetch_maneuver(p_id uuid)
RETURNS public.maneuver_row
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
    coalesce(tt.description, '{}'::jsonb)  AS description,
    coalesce(tt.prerequisite, '{}'::jsonb) AS prerequisite
  FROM public.fetch_resource(p_id) AS r
  JOIN public.maneuvers m ON m.resource_id = r.id
  LEFT JOIN (
    SELECT
      m.resource_id AS id,
      jsonb_object_agg(t.lang, t.prerequisite) AS prerequisite,
      jsonb_object_agg(t.lang, t.description)  AS description
    FROM public.maneuvers m
    LEFT JOIN public.maneuver_translations t ON t.resource_id = m.resource_id
    WHERE m.resource_id = p_id
    GROUP BY m.resource_id
  ) tt ON tt.id = r.id;
$$;

ALTER FUNCTION public.fetch_maneuver(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_maneuver(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_maneuver(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_maneuver(p_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.fetch_maneuvers(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.maneuver_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'maneuver'::public.resource_kind
),
mt AS (
  SELECT
    b.id,
    jsonb_object_agg(t.lang, t.prerequisite) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS prerequisite,
    jsonb_object_agg(t.lang, t.description)  FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description
  FROM base b
  LEFT JOIN public.maneuver_translations t ON t.resource_id = b.id
  LEFT JOIN (SELECT 1) _ ON true
  GROUP BY b.id
)
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
  coalesce(mt.description, '{}'::jsonb)  AS description,
  coalesce(mt.prerequisite, '{}'::jsonb) AS prerequisite
FROM base b
LEFT JOIN mt ON mt.id = b.id
ORDER BY
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'asc'
      THEN (b.name->>coalesce(p_langs[1],'en'))
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'desc'
      THEN (b.name->>coalesce(p_langs[1],'en'))
  END DESC NULLS LAST;
$$;

ALTER FUNCTION public.fetch_maneuvers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_maneuvers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_maneuvers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_maneuvers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;

CREATE OR REPLACE FUNCTION public.upsert_maneuver_translation(
  p_id uuid,
  p_lang text,
  p_maneuver_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.maneuver_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.maneuver_translations, p_maneuver_translation);

  INSERT INTO public.maneuver_translations AS st (
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

ALTER FUNCTION public.upsert_maneuver_translation(p_id uuid, p_lang text, p_maneuver_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_maneuver_translation(p_id uuid, p_lang text, p_maneuver_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_maneuver_translation(p_id uuid, p_lang text, p_maneuver_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_maneuver_translation(p_id uuid, p_lang text, p_maneuver_translation jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.update_maneuver(
  p_id uuid,
  p_lang text,
  p_maneuver jsonb,
  p_maneuver_translation jsonb)
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
    p_maneuver || jsonb_build_object('kind', 'maneuver'::public.resource_kind),
    p_maneuver_translation
  );

  UPDATE public.maneuvers m
  SET resource_id = m.resource_id
  WHERE m.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_maneuver_translation(p_id, p_lang, p_maneuver_translation);
END;
$$;

ALTER FUNCTION public.update_maneuver(p_id uuid, p_lang text, p_maneuver jsonb, p_maneuver_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_maneuver(p_id uuid, p_lang text, p_maneuver jsonb, p_maneuver_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_maneuver(p_id uuid, p_lang text, p_maneuver jsonb, p_maneuver_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_maneuver(p_id uuid, p_lang text, p_maneuver jsonb, p_maneuver_translation jsonb) TO service_role;

