--------------------------------------------------------------------------------
-- SERVICES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.services (
  resource_id uuid NOT NULL,
  category public.service_category DEFAULT 'lifestyle'::public.service_category NOT NULL,
  cost integer DEFAULT 0 NOT NULL,
  cost_period public.service_cost_period DEFAULT 'once'::public.service_cost_period NOT NULL,
  CONSTRAINT services_pkey PRIMARY KEY (resource_id),
  CONSTRAINT services_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT services_cost_check CHECK (cost >= 0)
);

ALTER TABLE public.services OWNER TO postgres;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.services TO anon;
GRANT ALL ON TABLE public.services TO authenticated;
GRANT ALL ON TABLE public.services TO service_role;


--------------------------------------------------------------------------------
-- SERVICE TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.service_translations (
  resource_id uuid NOT NULL,
  lang text DEFAULT ''::text NOT NULL,
  availability text DEFAULT ''::text NOT NULL,
  description text DEFAULT ''::text NOT NULL,
  CONSTRAINT service_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT service_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.services(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT service_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.service_translations OWNER TO postgres;
ALTER TABLE public.service_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.service_translations TO anon;
GRANT ALL ON TABLE public.service_translations TO authenticated;
GRANT ALL ON TABLE public.service_translations TO service_role;


--------------------------------------------------------------------------------
-- SERVICE RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_service_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'service'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a service', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_service_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_service_resource_kind
  BEFORE INSERT OR UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_service_resource_kind();

GRANT ALL ON FUNCTION public.validate_service_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_service_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_service_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- SERVICES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read services"
ON public.services
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new services"
ON public.services
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update services"
ON public.services
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete services"
ON public.services
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- SERVICE TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read service translations"
ON public.service_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new service translations"
ON public.service_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update service translations"
ON public.service_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete service translations"
ON public.service_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));
