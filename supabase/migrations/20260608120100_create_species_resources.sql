CREATE TABLE IF NOT EXISTS public.species (
  resource_id uuid NOT NULL,
  type public.creature_type NOT NULL,
  sizes public.creature_size[] NOT NULL,
  speed integer NOT NULL,
  CONSTRAINT species_pkey PRIMARY KEY (resource_id),
  CONSTRAINT species_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT species_sizes_check CHECK (array_length(sizes, 1) > 0)
);

ALTER TABLE public.species OWNER TO postgres;
ALTER TABLE public.species ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.species_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  description text DEFAULT ''::text NOT NULL,
  CONSTRAINT species_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT species_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.species(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT species_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.species_translations OWNER TO postgres;
ALTER TABLE public.species_translations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_species_translations_lang ON public.species_translations USING btree (lang);

CREATE TYPE public.species_row AS (
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
  type public.creature_type,
  sizes public.creature_size[],
  speed integer,
  description jsonb
);

CREATE OR REPLACE FUNCTION public.create_species(
  p_source_id uuid,
  p_lang text,
  p_species jsonb,
  p_species_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.species%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.species, p_species);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_species || jsonb_build_object('kind', 'species'::public.resource_kind),
    p_species_translation
  );

  INSERT INTO public.species (
    resource_id, type, sizes, speed
  ) VALUES (
    v_id, r.type, r.sizes, r.speed
  );

  perform public.upsert_species_translation(v_id, p_lang, p_species_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_species(p_source_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.fetch_species(p_id uuid)
RETURNS public.species_row
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
    s.type,
    s.sizes,
    s.speed,
    coalesce(tt.description, '{}'::jsonb) AS description
  FROM public.fetch_resource(p_id) AS r
  JOIN public.species s ON s.resource_id = r.id
  LEFT JOIN (
    SELECT
      s.resource_id AS id,
      jsonb_object_agg(t.lang, t.description) AS description
    FROM public.species s
    LEFT JOIN public.species_translations t ON t.resource_id = s.resource_id
    WHERE s.resource_id = p_id
    GROUP BY s.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_species(p_id uuid) OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.fetch_species(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.species_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'true'
    ) AS types_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'false'
    ) AS types_exc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_size), null)
      FROM jsonb_each_text(p_filters->'sizes') AS e(key, value)
      WHERE e.value = 'true'
    ) AS sizes_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_size), null)
      FROM jsonb_each_text(p_filters->'sizes') AS e(key, value)
      WHERE e.value = 'false'
    ) AS sizes_exc
),
base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'species'::public.resource_kind
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
    s.type,
    s.sizes,
    s.speed
  FROM base b
  JOIN public.species s ON s.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
    (p.types_inc IS NULL OR s.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (s.type = any(p.types_exc)))
    AND (p.sizes_inc IS NULL OR s.sizes && p.sizes_inc)
    AND (p.sizes_exc IS NULL OR NOT (s.sizes && p.sizes_exc))
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.description) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description
  FROM filtered f
  LEFT JOIN public.species_translations t ON t.resource_id = f.id
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
  f.type,
  f.sizes,
  f.speed,
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

ALTER FUNCTION public.fetch_species(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.upsert_species_translation(
  p_id uuid,
  p_lang text,
  p_species_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.species_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.species_translations, p_species_translation);

  INSERT INTO public.species_translations AS st (
    resource_id, lang, description
  ) VALUES (
    p_id, p_lang, r.description
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    description = excluded.description;

  perform public.upsert_resource_translation(p_id, p_lang, p_species_translation);
END;
$$;

ALTER FUNCTION public.upsert_species_translation(p_id uuid, p_lang text, p_species_translation jsonb) OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.update_species(
  p_id uuid,
  p_lang text,
  p_species jsonb,
  p_species_translation jsonb)
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
    p_species || jsonb_build_object('kind', 'species'::public.resource_kind),
    p_species_translation
  );

  UPDATE public.species s
  SET (
    type,
    sizes,
    speed
  ) = (
    SELECT r.type, r.sizes, r.speed
    FROM jsonb_populate_record(null::public.species, to_jsonb(s) || p_species) AS r
  )
  WHERE s.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_species_translation(p_id, p_lang, p_species_translation);
END;
$$;

ALTER FUNCTION public.update_species(p_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.validate_species_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'species'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a species', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_species_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_species_resource_kind
  BEFORE INSERT OR UPDATE ON public.species
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_species_resource_kind();

GRANT ALL ON TABLE public.species TO anon;
GRANT ALL ON TABLE public.species TO authenticated;
GRANT ALL ON TABLE public.species TO service_role;
GRANT ALL ON TABLE public.species_translations TO anon;
GRANT ALL ON TABLE public.species_translations TO authenticated;
GRANT ALL ON TABLE public.species_translations TO service_role;
GRANT ALL ON FUNCTION public.create_species(p_source_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_species(p_source_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_species(p_source_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) TO service_role;
GRANT ALL ON FUNCTION public.fetch_species(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_species(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_species(p_id uuid) TO service_role;
GRANT ALL ON FUNCTION public.fetch_species(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_species(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_species(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;
GRANT ALL ON FUNCTION public.upsert_species_translation(p_id uuid, p_lang text, p_species_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_species_translation(p_id uuid, p_lang text, p_species_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_species_translation(p_id uuid, p_lang text, p_species_translation jsonb) TO service_role;
GRANT ALL ON FUNCTION public.update_species(p_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_species(p_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_species(p_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) TO service_role;
GRANT ALL ON FUNCTION public.validate_species_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_species_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_species_resource_kind() TO service_role;

CREATE POLICY "Users can read species"
ON public.species
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new species"
ON public.species
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update species"
ON public.species
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete species"
ON public.species
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE POLICY "Users can read species translations"
ON public.species_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new species translations"
ON public.species_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update species translations"
ON public.species_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete species translations"
ON public.species_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));
