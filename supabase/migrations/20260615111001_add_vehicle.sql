--------------------------------------------------------------------------------
-- VEHICLES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.vehicles (
  resource_id uuid NOT NULL,
  cost integer DEFAULT 0 NOT NULL,
  speed integer DEFAULT 0 NOT NULL,
  crew_capacity integer DEFAULT 0 NOT NULL,
  passenger_capacity integer DEFAULT 0 NOT NULL,
  cargo integer DEFAULT 0 NOT NULL,
  ac integer DEFAULT 0 NOT NULL,
  hp integer DEFAULT 0 NOT NULL,
  damage_threshold integer DEFAULT 0 NOT NULL,
  CONSTRAINT vehicles_pkey PRIMARY KEY (resource_id),
  CONSTRAINT vehicles_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT vehicles_cost_check CHECK (cost >= 0),
  CONSTRAINT vehicles_speed_check CHECK (speed >= 0),
  CONSTRAINT vehicles_crew_capacity_check CHECK (crew_capacity >= 0),
  CONSTRAINT vehicles_passenger_capacity_check CHECK (passenger_capacity >= 0),
  CONSTRAINT vehicles_cargo_check CHECK (cargo >= 0),
  CONSTRAINT vehicles_ac_check CHECK (ac >= 0),
  CONSTRAINT vehicles_hp_check CHECK (hp >= 0),
  CONSTRAINT vehicles_damage_threshold_check CHECK (damage_threshold >= 0)
);

ALTER TABLE public.vehicles OWNER TO postgres;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.vehicles TO anon;
GRANT ALL ON TABLE public.vehicles TO authenticated;
GRANT ALL ON TABLE public.vehicles TO service_role;


--------------------------------------------------------------------------------
-- VEHICLE TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.vehicle_translations (
  resource_id uuid NOT NULL,
  lang text DEFAULT ''::text NOT NULL,
  description text DEFAULT ''::text NOT NULL,
  CONSTRAINT vehicle_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT vehicle_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.vehicles(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT vehicle_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.vehicle_translations OWNER TO postgres;
ALTER TABLE public.vehicle_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.vehicle_translations TO anon;
GRANT ALL ON TABLE public.vehicle_translations TO authenticated;
GRANT ALL ON TABLE public.vehicle_translations TO service_role;


--------------------------------------------------------------------------------
-- VEHICLE RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_vehicle_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'vehicle'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a vehicle', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_vehicle_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_vehicle_resource_kind
  BEFORE INSERT OR UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_vehicle_resource_kind();

GRANT ALL ON FUNCTION public.validate_vehicle_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_vehicle_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_vehicle_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- VEHICLES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read vehicles"
ON public.vehicles
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new vehicles"
ON public.vehicles
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update vehicles"
ON public.vehicles
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete vehicles"
ON public.vehicles
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- VEHICLE TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read vehicle translations"
ON public.vehicle_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new vehicle translations"
ON public.vehicle_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update vehicle translations"
ON public.vehicle_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete vehicle translations"
ON public.vehicle_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- VEHICLE ROW
--------------------------------------------------------------------------------

CREATE TYPE public.vehicle_row AS (
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
  -- Vehicle
  cost integer,
  speed integer,
  crew_capacity integer,
  passenger_capacity integer,
  cargo integer,
  ac integer,
  hp integer,
  damage_threshold integer,
  -- Vehicle Translation
  description jsonb
);


--------------------------------------------------------------------------------
-- CREATE VEHICLE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_vehicle(
  p_source_id uuid,
  p_lang text,
  p_vehicle jsonb,
  p_vehicle_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.vehicles%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.vehicles, p_vehicle);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_vehicle || jsonb_build_object('kind', 'vehicle'::public.resource_kind),
    p_vehicle_translation
  );

  INSERT INTO public.vehicles (
    resource_id,
    cost,
    speed,
    crew_capacity,
    passenger_capacity,
    cargo,
    ac,
    hp,
    damage_threshold
  ) VALUES (
    v_id,
    r.cost,
    r.speed,
    r.crew_capacity,
    r.passenger_capacity,
    r.cargo,
    r.ac,
    r.hp,
    r.damage_threshold
  );

  perform public.upsert_vehicle_translation(v_id, p_lang, p_vehicle_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_vehicle(p_source_id uuid, p_lang text, p_vehicle jsonb, p_vehicle_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_vehicle(p_source_id uuid, p_lang text, p_vehicle jsonb, p_vehicle_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_vehicle(p_source_id uuid, p_lang text, p_vehicle jsonb, p_vehicle_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_vehicle(p_source_id uuid, p_lang text, p_vehicle jsonb, p_vehicle_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH VEHICLE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_vehicle(p_id uuid)
RETURNS public.vehicle_row
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
    v.cost,
    v.speed,
    v.crew_capacity,
    v.passenger_capacity,
    v.cargo,
    v.ac,
    v.hp,
    v.damage_threshold,
    coalesce(tt.description, '{}'::jsonb) AS description
  FROM public.fetch_resource(p_id) AS r
  JOIN public.vehicles v ON v.resource_id = r.id
  LEFT JOIN (
    SELECT
      v.resource_id AS id,
      jsonb_object_agg(t.lang, t.description) AS description
    FROM public.vehicles v
    LEFT JOIN public.vehicle_translations t ON t.resource_id = v.resource_id
    WHERE v.resource_id = p_id
    GROUP BY v.resource_id
  ) tt ON tt.id = r.id;
$$;

ALTER FUNCTION public.fetch_vehicle(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_vehicle(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_vehicle(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_vehicle(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH VEHICLES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_vehicles(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.vehicle_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'vehicle'::public.resource_kind
),
vt AS (
  SELECT
    b.id,
    jsonb_object_agg(t.lang, t.description) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description
  FROM base b
  LEFT JOIN public.vehicle_translations t ON t.resource_id = b.id
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
  v.cost,
  v.speed,
  v.crew_capacity,
  v.passenger_capacity,
  v.cargo,
  v.ac,
  v.hp,
  v.damage_threshold,
  coalesce(vt.description, '{}'::jsonb) AS description
FROM base b
JOIN public.vehicles v ON v.resource_id = b.id
LEFT JOIN vt ON vt.id = b.id
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

ALTER FUNCTION public.fetch_vehicles(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_vehicles(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_vehicles(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_vehicles(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT VEHICLE TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_vehicle_translation(
  p_id uuid,
  p_lang text,
  p_vehicle_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.vehicle_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.vehicle_translations, p_vehicle_translation);

  INSERT INTO public.vehicle_translations AS vt (
    resource_id, lang, description
  ) VALUES (
    p_id, p_lang, r.description
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    description = excluded.description;
END;
$$;

ALTER FUNCTION public.upsert_vehicle_translation(p_id uuid, p_lang text, p_vehicle_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_vehicle_translation(p_id uuid, p_lang text, p_vehicle_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_vehicle_translation(p_id uuid, p_lang text, p_vehicle_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_vehicle_translation(p_id uuid, p_lang text, p_vehicle_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE VEHICLE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_vehicle(
  p_id uuid,
  p_lang text,
  p_vehicle jsonb,
  p_vehicle_translation jsonb)
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
    p_vehicle || jsonb_build_object('kind', 'vehicle'::public.resource_kind),
    p_vehicle_translation
  );

  UPDATE public.vehicles v
  SET
    cost = r.cost,
    speed = r.speed,
    crew_capacity = r.crew_capacity,
    passenger_capacity = r.passenger_capacity,
    cargo = r.cargo,
    ac = r.ac,
    hp = r.hp,
    damage_threshold = r.damage_threshold
  FROM jsonb_populate_record(null::public.vehicles, p_vehicle) AS r
  WHERE v.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_vehicle_translation(p_id, p_lang, p_vehicle_translation);
END;
$$;

ALTER FUNCTION public.update_vehicle(p_id uuid, p_lang text, p_vehicle jsonb, p_vehicle_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_vehicle(p_id uuid, p_lang text, p_vehicle jsonb, p_vehicle_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_vehicle(p_id uuid, p_lang text, p_vehicle jsonb, p_vehicle_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_vehicle(p_id uuid, p_lang text, p_vehicle jsonb, p_vehicle_translation jsonb) TO service_role;
