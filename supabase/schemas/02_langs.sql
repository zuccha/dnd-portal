--------------------------------------------------------------------------------
-- LANGUAGES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.langs (
    code text NOT NULL,
    label text NOT NULL,
    CONSTRAINT langs_pkey PRIMARY KEY (code),
    CONSTRAINT langs_code_check CHECK ((code ~ '^[a-z]{2}(-[A-Z]{2})?$'::text))
);

ALTER TABLE public.langs OWNER TO postgres;

CREATE POLICY "Enable read access for all users" ON public.langs FOR SELECT USING (true);

ALTER TABLE public.langs ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.langs TO anon;
GRANT ALL ON TABLE public.langs TO authenticated;
GRANT ALL ON TABLE public.langs TO service_role;
