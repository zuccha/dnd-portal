--------------------------------------------------------------------------------
-- ELDRITCH INVOCATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.eldritch_invocations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_id uuid NOT NULL,
    min_warlock_level smallint NOT NULL,
    visibility public.campaign_role DEFAULT 'game_master'::public.campaign_role NOT NULL,
    CONSTRAINT eldritch_invocations_pkey PRIMARY KEY (id),
    CONSTRAINT eldritch_invocations_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT eldritch_invocations_min_warlock_level_check CHECK (((min_warlock_level >= 0) AND (min_warlock_level <= 20)))
);

ALTER TABLE public.eldritch_invocations OWNER TO postgres;
ALTER TABLE public.eldritch_invocations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.eldritch_invocations TO anon;
GRANT ALL ON TABLE public.eldritch_invocations TO authenticated;
GRANT ALL ON TABLE public.eldritch_invocations TO service_role;


--------------------------------------------------------------------------------
-- ELDRITCH INVOCATION TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.eldritch_invocation_translations (
    eldritch_invocation_id uuid DEFAULT gen_random_uuid() NOT NULL,
    lang text DEFAULT ''::text NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    prerequisite text,
    description text DEFAULT ''::text NOT NULL,
    page text,
    CONSTRAINT eldritch_invocation_translations_pkey PRIMARY KEY (eldritch_invocation_id, lang),
    CONSTRAINT eldritch_invocation_translations_eldritch_invocation_id_fkey FOREIGN KEY (eldritch_invocation_id) REFERENCES public.eldritch_invocations(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT eldritch_invocation_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.eldritch_invocation_translations OWNER TO postgres;
ALTER TABLE public.eldritch_invocation_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.eldritch_invocation_translations TO anon;
GRANT ALL ON TABLE public.eldritch_invocation_translations TO authenticated;
GRANT ALL ON TABLE public.eldritch_invocation_translations TO service_role;


--------------------------------------------------------------------------------
-- CAN READ ELDRITCH INVOCATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_read_eldritch_invocation(p_campaign_id uuid, p_eldritch_invocation_visibility public.campaign_role) RETURNS boolean
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns c
    LEFT JOIN public.user_modules um ON (um.module_id = c.id AND um.user_id = (SELECT auth.uid() AS uid))
    LEFT JOIN public.campaign_players cp ON (cp.campaign_id = c.id AND cp.user_id = (SELECT auth.uid() AS uid))
    WHERE c.id = p_campaign_id
      AND (
        (c.is_module = true AND c.visibility = 'public'::public.campaign_visibility)
        OR
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        (c.is_module = false AND cp.user_id IS NOT NULL AND (
          p_eldritch_invocation_visibility = 'player'::public.campaign_role
          OR cp.role = 'game_master'::public.campaign_role
        ))
      )
  );
END;
$$;

ALTER FUNCTION public.can_read_eldritch_invocation(p_campaign_id uuid, p_eldritch_invocation_visibility public.campaign_role) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_read_eldritch_invocation(p_campaign_id uuid, p_eldritch_invocation_visibility public.campaign_role) TO anon;
GRANT ALL ON FUNCTION public.can_read_eldritch_invocation(p_campaign_id uuid, p_eldritch_invocation_visibility public.campaign_role) TO authenticated;
GRANT ALL ON FUNCTION public.can_read_eldritch_invocation(p_campaign_id uuid, p_eldritch_invocation_visibility public.campaign_role) TO service_role;


--------------------------------------------------------------------------------
-- CAN READ ELDRITCH INVOCATION TRANSLATION
--------------------------------------------------------------------------------


CREATE OR REPLACE FUNCTION public.can_read_eldritch_invocation_translation(p_eldritch_invocation_id uuid) RETURNS boolean
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  SELECT can_read_eldritch_invocation(ei.campaign_id, ei.visibility)
  FROM public.eldritch_invocations ei
  WHERE ei.id = p_eldritch_invocation_id;
END;
$$;

ALTER FUNCTION public.can_read_eldritch_invocation_translation(p_eldritch_invocation_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_read_eldritch_invocation_translation(p_eldritch_invocation_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_read_eldritch_invocation_translation(p_eldritch_invocation_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_read_eldritch_invocation_translation(p_eldritch_invocation_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- CAN EDIT ELDRITCH INVOCATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_edit_eldritch_invocation(p_campaign_id uuid) RETURNS boolean
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns c
    LEFT JOIN public.user_modules um ON (um.module_id = c.id AND um.user_id = (SELECT auth.uid() AS uid) AND um.role = 'creator'::public.module_role)
    LEFT JOIN public.campaign_players cp ON (cp.campaign_id = c.id AND cp.user_id = (SELECT auth.uid() as uid) AND cp.role = 'game_master'::public.campaign_role)
    WHERE c.id = p_campaign_id
      AND (
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        (c.is_module = false AND cp.user_id IS NOT NULL)
      )
  );
END;
$$;

ALTER FUNCTION public.can_edit_eldritch_invocation(p_campaign_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_edit_eldritch_invocation(p_campaign_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_edit_eldritch_invocation(p_campaign_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_edit_eldritch_invocation(p_campaign_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- CAN EDIT ELDRITCH INVOCATION TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_edit_eldritch_invocation_translation(p_eldritch_invocation_id uuid) RETURNS boolean
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  SELECT can_edit_eldritch_invocation(ei.campaign_id)
  FROM public.eldritch_invocations ei
  WHERE ei.id = p_eldritch_invocation_id;
END;
$$;

ALTER FUNCTION public.can_edit_eldritch_invocation_translation(p_eldritch_invocation_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_edit_eldritch_invocation_translation(p_eldritch_invocation_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_edit_eldritch_invocation_translation(p_eldritch_invocation_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_edit_eldritch_invocation_translation(p_eldritch_invocation_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- ELDRITCH INVOCATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read eldritch invocations"
ON public.eldritch_invocations
FOR SELECT
TO authenticated
USING ( public.can_read_eldritch_invocation(campaign_id, visibility) OR public.can_edit_eldritch_invocation(campaign_id) );

CREATE POLICY "Creators and GMs can create new eldritch invocations"
ON public.eldritch_invocations
FOR INSERT
TO authenticated
WITH CHECK ( public.can_edit_eldritch_invocation(campaign_id) );

CREATE POLICY "Creators and GMs can update eldritch invocations"
ON public.eldritch_invocations
FOR UPDATE
TO authenticated
USING ( public.can_edit_eldritch_invocation(campaign_id) )
WITH CHECK ( public.can_edit_eldritch_invocation(campaign_id) );

CREATE POLICY "Creators and GMs can delete eldritch invocations"
ON public.eldritch_invocations
FOR DELETE
TO authenticated
USING ( public.can_edit_eldritch_invocation(campaign_id) );


--------------------------------------------------------------------------------
-- ELDRITCH INVOCATION TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read eldritch invocation translations"
ON public.eldritch_invocation_translations
FOR SELECT
TO authenticated
USING ( public.can_read_eldritch_invocation_translation(eldritch_invocation_id) OR public.can_edit_eldritch_invocation_translation(eldritch_invocation_id) );

CREATE POLICY "Creators and GMs can create new eldritch invocation translations"
ON public.eldritch_invocation_translations
FOR INSERT
TO authenticated
WITH CHECK ( public.can_edit_eldritch_invocation_translation(eldritch_invocation_id) );

CREATE POLICY "Creators and GMs can update eldritch invocation translations"
ON public.eldritch_invocation_translations
FOR UPDATE
TO authenticated
USING ( public.can_edit_eldritch_invocation_translation(eldritch_invocation_id) )
WITH CHECK ( public.can_edit_eldritch_invocation_translation(eldritch_invocation_id) );

CREATE POLICY "Creators and GMs can delete eldritch invocation translations"
ON public.eldritch_invocation_translations
FOR DELETE
TO authenticated
USING ( public.can_edit_eldritch_invocation_translation(eldritch_invocation_id) );


--------------------------------------------------------------------------------
-- CREATE ELDRITCH INVOCATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_eldritch_invocation(p_campaign_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) RETURNS uuid
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_id uuid;
  r public.eldritch_invocations%ROWTYPE;
begin
  r := jsonb_populate_record(null::public.eldritch_invocations, p_eldritch_invocation);

  insert into public.eldritch_invocations (
    campaign_id, min_warlock_level, visibility
  ) values (
    p_campaign_id, r.min_warlock_level, r.visibility
  )
  returning id into v_id;

  perform public.upsert_eldritch_invocation_translation(v_id, p_lang, p_eldritch_invocation_translation);

  return v_id;
end;
$$;

ALTER FUNCTION public.create_eldritch_invocation(p_campaign_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_eldritch_invocation(p_campaign_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_eldritch_invocation(p_campaign_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_eldritch_invocation(p_campaign_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH ELDRITCH INVOCATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_eldritch_invocation(p_id uuid) RETURNS record
    LANGUAGE sql
    SET search_path TO 'public', 'pg_temp'
    AS $$
  select
    e.id,
    e.campaign_id,
    c.name as campaign_name,
    e.min_warlock_level,
    coalesce(tt.name,         '{}'::jsonb)  as name,
    coalesce(tt.prerequisite, '{}'::jsonb)  as prerequisite,
    coalesce(tt.description,  '{}'::jsonb)  as description,
    e.visibility
  from public.eldritch_invocations e
  join public.campaigns c on c.id = e.campaign_id
  left join (
    select
      e.id,
      jsonb_object_agg(t.lang, t.name)         as name,
      jsonb_object_agg(t.lang, t.prerequisite) as prerequisite,
      jsonb_object_agg(t.lang, t.description)  as description
    from public.eldritch_invocations e
    left join public.eldritch_invocation_translations t on t.eldritch_invocation_id = e.id
    where e.id = p_id
    group by e.id
  ) tt on tt.id = e.id
  where e.id = p_id;
$$;

ALTER FUNCTION public.fetch_eldritch_invocation(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_eldritch_invocation(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_eldritch_invocation(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_eldritch_invocation(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH ELDRITCH INVOCATIONS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_eldritch_invocations(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text) RETURNS TABLE(id uuid, campaign_id uuid, campaign_name text, min_warlock_level smallint, name jsonb, prerequisite jsonb, description jsonb, visibility public.campaign_role)
    LANGUAGE sql
    SET search_path TO 'public', 'pg_temp'
    AS $$
with prefs as (
  select coalesce( (p_filters->>'warlock_level')::int, 20 ) as warlock_level
),
src as (
  select e.*
  from public.eldritch_invocations e
  join public.campaigns c on c.id = e.campaign_id
  where e.campaign_id = p_campaign_id
),
filtered as (
  select s.*
  from src s, prefs p
  where s.min_warlock_level <= p.warlock_level
),
t as (
  select
    f.id,
    jsonb_object_agg(t.lang, t.name)                                                                                 as name,
    jsonb_object_agg(t.lang, t.prerequisite) filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as prerequisite,
    jsonb_object_agg(t.lang, t.description)  filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as description
  from filtered f
  left join public.eldritch_invocation_translations t on t.eldritch_invocation_id = f.id
  left join (select 1) _ on true  -- keep p_langs in scope
  group by f.id
)
select
  f.id,
  f.campaign_id,
  c.name as campaign_name,
  f.min_warlock_level,
  coalesce(tt.name,         '{}'::jsonb)  as name,
  coalesce(tt.prerequisite, '{}'::jsonb)  as prerequisite,
  coalesce(tt.description,  '{}'::jsonb)  as description,
  f.visibility
from filtered f
join public.campaigns c on c.id = f.campaign_id
left join t tt on tt.id = f.id
order by
  case
    when p_order_by = 'name' and p_order_dir = 'asc'
      then (tt.name->>coalesce(p_langs[1],'en'))
  end asc nulls last,
  case
    when p_order_by = 'name' and p_order_dir = 'desc'
      then (tt.name->>coalesce(p_langs[1],'en'))
  end desc nulls last;
$$;

ALTER FUNCTION public.fetch_eldritch_invocations(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_eldritch_invocations(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_eldritch_invocations(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_eldritch_invocations(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT ELDRITCH INVOCATION TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_eldritch_invocation_translation(p_id uuid, p_lang text, p_eldritch_invocation_translation jsonb) RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  r public.eldritch_invocation_translations%ROWTYPE;
begin
  r := jsonb_populate_record(null::public.eldritch_invocation_translations, p_eldritch_invocation_translation);

  insert into public.eldritch_invocation_translations as st (
    eldritch_invocation_id, lang, name, prerequisite, description
  ) values (
    p_id, p_lang, r.name, r.prerequisite, r.description
  )
  on conflict (eldritch_invocation_id, lang) do update
  set
    name = excluded.name,
    prerequisite = excluded.prerequisite,
    description = excluded.description;
end;
$$;

ALTER FUNCTION public.upsert_eldritch_invocation_translation(p_id uuid, p_lang text, p_eldritch_invocation_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_eldritch_invocation_translation(p_id uuid, p_lang text, p_eldritch_invocation_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_eldritch_invocation_translation(p_id uuid, p_lang text, p_eldritch_invocation_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_eldritch_invocation_translation(p_id uuid, p_lang text, p_eldritch_invocation_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE ELDRITCH INVOCATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_eldritch_invocation(p_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_rows int;
begin
  update public.eldritch_invocations e
  set (
    min_warlock_level, visibility
  ) = (
    select r.min_warlock_level, r.visibility
    from jsonb_populate_record(null::public.eldritch_invocations, to_jsonb(e) || p_eldritch_invocation) as r
  )
  where e.id = p_id;

  get diagnostics v_rows = ROW_COUNT;
  if v_rows = 0 then
    raise exception 'No row with id %', p_id;
  end if;

  perform public.upsert_eldritch_invocation_translation(p_id, p_lang, p_eldritch_invocation_translation);
end;
$$;

ALTER FUNCTION public.update_eldritch_invocation(p_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_eldritch_invocation(p_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_eldritch_invocation(p_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_eldritch_invocation(p_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) TO service_role;
