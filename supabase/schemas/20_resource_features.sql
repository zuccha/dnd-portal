--------------------------------------------------------------------------------
-- RESOURCE FEATURES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.resource_features (
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
