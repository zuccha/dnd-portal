CREATE TABLE IF NOT EXISTS public.metamagics (
  resource_id uuid NOT NULL,
  sorcery_points smallint NOT NULL,
  CONSTRAINT metamagics_pkey PRIMARY KEY (resource_id),
  CONSTRAINT metamagics_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT metamagics_sorcery_points_check CHECK (sorcery_points >= 0)
);

ALTER TABLE public.metamagics OWNER TO postgres;
ALTER TABLE public.metamagics ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.metamagics TO anon;
GRANT ALL ON TABLE public.metamagics TO authenticated;
GRANT ALL ON TABLE public.metamagics TO service_role;

CREATE TABLE IF NOT EXISTS public.metamagic_translations (
  resource_id uuid NOT NULL,
  lang text DEFAULT ''::text NOT NULL,
  prerequisite text DEFAULT ''::text NOT NULL,
  description text DEFAULT ''::text NOT NULL,
  CONSTRAINT metamagic_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT metamagic_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.metamagics(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT metamagic_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.metamagic_translations OWNER TO postgres;
ALTER TABLE public.metamagic_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.metamagic_translations TO anon;
GRANT ALL ON TABLE public.metamagic_translations TO authenticated;
GRANT ALL ON TABLE public.metamagic_translations TO service_role;

CREATE OR REPLACE FUNCTION public.validate_metamagic_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'metamagic'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a metamagic option', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_metamagic_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_metamagic_resource_kind
  BEFORE INSERT OR UPDATE ON public.metamagics
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_metamagic_resource_kind();

GRANT ALL ON FUNCTION public.validate_metamagic_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_metamagic_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_metamagic_resource_kind() TO service_role;

CREATE POLICY "Users can read metamagics"
ON public.metamagics
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new metamagics"
ON public.metamagics
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update metamagics"
ON public.metamagics
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete metamagics"
ON public.metamagics
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE POLICY "Users can read metamagic translations"
ON public.metamagic_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new metamagic translations"
ON public.metamagic_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update metamagic translations"
ON public.metamagic_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete metamagic translations"
ON public.metamagic_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE TYPE public.metamagic_row AS (
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
  sorcery_points smallint,
  description jsonb,
  prerequisite jsonb
);

CREATE OR REPLACE FUNCTION public.create_metamagic(
  p_source_id uuid,
  p_lang text,
  p_metamagic jsonb,
  p_metamagic_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  m public.metamagics%ROWTYPE;
BEGIN
  m := jsonb_populate_record(null::public.metamagics, p_metamagic);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_metamagic || jsonb_build_object('kind', 'metamagic'::public.resource_kind),
    p_metamagic_translation
  );

  INSERT INTO public.metamagics (
    resource_id, sorcery_points
  ) VALUES (
    v_id, m.sorcery_points
  );

  perform public.upsert_metamagic_translation(v_id, p_lang, p_metamagic_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_metamagic(p_source_id uuid, p_lang text, p_metamagic jsonb, p_metamagic_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_metamagic(p_source_id uuid, p_lang text, p_metamagic jsonb, p_metamagic_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_metamagic(p_source_id uuid, p_lang text, p_metamagic jsonb, p_metamagic_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_metamagic(p_source_id uuid, p_lang text, p_metamagic jsonb, p_metamagic_translation jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.fetch_metamagic(p_id uuid)
RETURNS public.metamagic_row
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
    m.sorcery_points,
    coalesce(tt.description, '{}'::jsonb)  AS description,
    coalesce(tt.prerequisite, '{}'::jsonb) AS prerequisite
  FROM public.fetch_resource(p_id) AS r
  JOIN public.metamagics m ON m.resource_id = r.id
  LEFT JOIN (
    SELECT
      m.resource_id AS id,
      jsonb_object_agg(t.lang, t.prerequisite) AS prerequisite,
      jsonb_object_agg(t.lang, t.description)  AS description
    FROM public.metamagics m
    LEFT JOIN public.metamagic_translations t ON t.resource_id = m.resource_id
    WHERE m.resource_id = p_id
    GROUP BY m.resource_id
  ) tt ON tt.id = r.id;
$$;

ALTER FUNCTION public.fetch_metamagic(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_metamagic(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_metamagic(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_metamagic(p_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.fetch_metamagics(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.metamagic_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'metamagic'::public.resource_kind
),
metamagic AS (
  SELECT b.*, m.sorcery_points
  FROM base b
  JOIN public.metamagics m ON m.resource_id = b.id
),
mt AS (
  SELECT
    m.id,
    jsonb_object_agg(t.lang, t.prerequisite) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS prerequisite,
    jsonb_object_agg(t.lang, t.description)  FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description
  FROM metamagic m
  LEFT JOIN public.metamagic_translations t ON t.resource_id = m.id
  LEFT JOIN (SELECT 1) _ ON true
  GROUP BY m.id
)
SELECT
  m.id,
  m.source_id,
  m.source_code,
  m.source_version,
  m.kind,
  m.visibility,
  m.image_url,
  m.name,
  m.name_short,
  m.page,
  m.sorcery_points,
  coalesce(mt.description, '{}'::jsonb)  AS description,
  coalesce(mt.prerequisite, '{}'::jsonb) AS prerequisite
FROM metamagic m
LEFT JOIN mt ON mt.id = m.id
ORDER BY
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'asc'
      THEN (m.name->>coalesce(p_langs[1],'en'))
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'desc'
      THEN (m.name->>coalesce(p_langs[1],'en'))
  END DESC NULLS LAST;
$$;

ALTER FUNCTION public.fetch_metamagics(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_metamagics(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_metamagics(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_metamagics(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;

CREATE OR REPLACE FUNCTION public.upsert_metamagic_translation(
  p_id uuid,
  p_lang text,
  p_metamagic_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.metamagic_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.metamagic_translations, p_metamagic_translation);

  INSERT INTO public.metamagic_translations AS st (
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

ALTER FUNCTION public.upsert_metamagic_translation(p_id uuid, p_lang text, p_metamagic_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_metamagic_translation(p_id uuid, p_lang text, p_metamagic_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_metamagic_translation(p_id uuid, p_lang text, p_metamagic_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_metamagic_translation(p_id uuid, p_lang text, p_metamagic_translation jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.update_metamagic(
  p_id uuid,
  p_lang text,
  p_metamagic jsonb,
  p_metamagic_translation jsonb)
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
    p_metamagic || jsonb_build_object('kind', 'metamagic'::public.resource_kind),
    p_metamagic_translation
  );

  UPDATE public.metamagics m
  SET (
    sorcery_points
  ) = (
    SELECT mm.sorcery_points
    FROM jsonb_populate_record(null::public.metamagics, to_jsonb(m) || p_metamagic) AS mm
  )
  WHERE m.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_metamagic_translation(p_id, p_lang, p_metamagic_translation);
END;
$$;

ALTER FUNCTION public.update_metamagic(p_id uuid, p_lang text, p_metamagic jsonb, p_metamagic_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_metamagic(p_id uuid, p_lang text, p_metamagic jsonb, p_metamagic_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_metamagic(p_id uuid, p_lang text, p_metamagic jsonb, p_metamagic_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_metamagic(p_id uuid, p_lang text, p_metamagic jsonb, p_metamagic_translation jsonb) TO service_role;
