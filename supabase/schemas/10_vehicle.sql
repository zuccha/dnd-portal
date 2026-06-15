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
