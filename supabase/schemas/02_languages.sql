--------------------------------------------------------------------------------
-- LANGUAGES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.languages (
    code text NOT NULL,
    label text NOT NULL,
    CONSTRAINT languages_pkey PRIMARY KEY (code),
    CONSTRAINT languages_code_check CHECK ((code ~ '^[a-z]{2}(-[A-Z]{2})?$'::text))
);

ALTER TABLE public.languages OWNER TO postgres;

CREATE POLICY "Enable read access for all users" ON public.languages FOR SELECT USING (true);

ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.languages TO anon;
GRANT ALL ON TABLE public.languages TO authenticated;
GRANT ALL ON TABLE public.languages TO service_role;
