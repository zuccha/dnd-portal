--------------------------------------------------------------------------------
-- SPELLS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.spells (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    level smallint NOT NULL,
    school public.spell_school NOT NULL,
    character_classes public.character_class[] NOT NULL,
    concentration boolean NOT NULL,
    ritual boolean NOT NULL,
    somatic boolean NOT NULL,
    verbal boolean NOT NULL,
    material boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    campaign_id uuid NOT NULL,
    visibility public.campaign_role DEFAULT 'player'::public.campaign_role NOT NULL,
    casting_time public.spell_casting_time DEFAULT 'action'::public.spell_casting_time NOT NULL,
    casting_time_value text,
    duration public.spell_duration DEFAULT 'value'::public.spell_duration NOT NULL,
    duration_value text,
    range public.spell_range DEFAULT 'self'::public.spell_range NOT NULL,
    range_value_imp text,
    range_value_met text,
    CONSTRAINT spells_pkey PRIMARY KEY (id),
    CONSTRAINT spells_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT spells_casting_time_pair_chk CHECK (((casting_time = 'value'::public.spell_casting_time) = (casting_time_value IS NOT NULL))),
    CONSTRAINT spells_casting_time_value_check CHECK ((casting_time_value ~ '^\d+(\.\d+)?\s*(round|s|min|hr|d)$'::text)),
    CONSTRAINT spells_duration_pair_chk CHECK (((duration = 'value'::public.spell_duration) = (duration_value IS NOT NULL))),
    CONSTRAINT spells_duration_value_check CHECK ((duration_value ~ '^\d+(\.\d+)?\s*(round|s|min|hr|d)$'::text)),
    CONSTRAINT spells_level_check CHECK (((level >= 0) AND (level <= 9))),
    CONSTRAINT spells_range_pair_chk CHECK ((((range = 'value'::public.spell_range) = (range_value_imp IS NOT NULL)) AND ((range = 'value'::public.spell_range) = (range_value_met IS NOT NULL)))),
    CONSTRAINT spells_range_value_imp_check CHECK ((range_value_imp ~ '^\d+(\.\d+)?\s*(ft|mi)$'::text)),
    CONSTRAINT spells_range_value_met_check CHECK ((range_value_met ~ '^\d+(\.\d+)?\s*(m|km)$'::text))
);

ALTER TABLE public.spells OWNER TO postgres;
ALTER TABLE public.spells ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.spells TO anon;
GRANT ALL ON TABLE public.spells TO authenticated;
GRANT ALL ON TABLE public.spells TO service_role;


--------------------------------------------------------------------------------
-- SPELL TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.spell_translations (
    spell_id uuid NOT NULL,
    lang text NOT NULL,
    name text NOT NULL,
    page text,
    materials text,
    description text NOT NULL,
    upgrade text,
    CONSTRAINT spell_translations_pkey PRIMARY KEY (spell_id, lang),
    CONSTRAINT spell_translations_spell_id_fkey FOREIGN KEY (spell_id) REFERENCES public.spells(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT spell_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.languages(code) ON DELETE CASCADE
);

ALTER TABLE public.spell_translations OWNER TO postgres;
ALTER TABLE public.spell_translations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_spell_translations_lang ON public.spell_translations USING btree (lang);

GRANT ALL ON TABLE public.spell_translations TO anon;
GRANT ALL ON TABLE public.spell_translations TO authenticated;
GRANT ALL ON TABLE public.spell_translations TO service_role;


--------------------------------------------------------------------------------
-- SPELLS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read spells" ON public.spells FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    LEFT JOIN public.user_modules um ON (um.module_id = c.id AND um.user_id = ( SELECT auth.uid() AS uid))
    LEFT JOIN public.campaign_players cp ON (cp.campaign_id = c.id AND cp.user_id = ( SELECT auth.uid() AS uid))
    WHERE c.id = spells.campaign_id
      AND (
        -- Public modules
        (c.is_module = true AND c.visibility = 'public'::public.campaign_visibility)
        OR
        -- Owned modules
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        -- Non-module campaigns with visibility check
        (c.is_module = false AND cp.user_id IS NOT NULL AND (
          spells.visibility = 'player'::public.campaign_role
          OR cp.role = 'game_master'::public.campaign_role
        ))
      )
  )
);

CREATE POLICY "Creators and GMs can edit spells" ON public.spells TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    LEFT JOIN public.user_modules um ON (um.module_id = c.id AND um.user_id = ( SELECT auth.uid() AS uid) AND um.role = 'creator'::public.module_role)
    LEFT JOIN public.campaign_players cp ON (cp.campaign_id = c.id AND cp.user_id = ( SELECT auth.uid() AS uid) AND cp.role = 'game_master'::public.campaign_role)
    WHERE c.id = spells.campaign_id
      AND (
        -- Module creators
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        -- Campaign GMs
        (c.is_module = false AND cp.user_id IS NOT NULL)
      )
  )
);


--------------------------------------------------------------------------------
-- SPELL TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read spell translations" ON public.spell_translations FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.spells sp
    JOIN public.campaigns c ON c.id = sp.campaign_id
    LEFT JOIN public.user_modules um ON (um.module_id = c.id AND um.user_id = ( SELECT auth.uid() AS uid))
    LEFT JOIN public.campaign_players cp ON (cp.campaign_id = c.id AND cp.user_id = ( SELECT auth.uid() AS uid))
    WHERE sp.id = spell_translations.spell_id
      AND (
        -- Public modules
        (c.is_module = true AND c.visibility = 'public'::public.campaign_visibility)
        OR
        -- Owned modules
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        -- Non-module campaigns with visibility check
        (c.is_module = false AND cp.user_id IS NOT NULL AND (
          sp.visibility = 'player'::public.campaign_role
          OR cp.role = 'game_master'::public.campaign_role
        ))
      )
  )
);

CREATE POLICY "Creators and GMs can edit spell translations" ON public.spell_translations TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.spells sp
    JOIN public.campaigns c ON c.id = sp.campaign_id
    LEFT JOIN public.user_modules um ON (um.module_id = c.id AND um.user_id = ( SELECT auth.uid() AS uid) AND um.role = 'creator'::public.module_role)
    LEFT JOIN public.campaign_players cp ON (cp.campaign_id = c.id AND cp.user_id = ( SELECT auth.uid() AS uid) AND cp.role = 'game_master'::public.campaign_role)
    WHERE sp.id = spell_translations.spell_id
      AND (
        -- Module creators
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        -- Campaign GMs
        (c.is_module = false AND cp.user_id IS NOT NULL)
      )
  )
);


--------------------------------------------------------------------------------
-- CREATE SPELL
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_spell(p_campaign_id uuid, p_lang text, p_spell jsonb, p_spell_translation jsonb) RETURNS uuid
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_id uuid;
  r public.spells%ROWTYPE;
begin
  r := jsonb_populate_record(null::public.spells, p_spell);

  insert into public.spells (
    campaign_id, level, school,
    character_classes, casting_time, casting_time_value,
    duration, duration_value, range, range_value_imp, range_value_met,
    concentration, ritual, verbal, somatic, material, visibility
  ) values (
    p_campaign_id, r.level, r.school,
    r.character_classes, r.casting_time, r.casting_time_value,
    r.duration, r.duration_value, r.range, r.range_value_imp, r.range_value_met,
    r.concentration, r.ritual, r.verbal, r.somatic, r.material, r.visibility
  )
  returning id into v_id;

  perform public.upsert_spell_translation(v_id, p_lang, p_spell_translation);

  return v_id;
end;
$$;

ALTER FUNCTION public.create_spell(p_campaign_id uuid, p_lang text, p_spell jsonb, p_spell_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_spell(p_campaign_id uuid, p_lang text, p_spell jsonb, p_spell_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_spell(p_campaign_id uuid, p_lang text, p_spell jsonb, p_spell_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_spell(p_campaign_id uuid, p_lang text, p_spell jsonb, p_spell_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH SPELL
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_spell(p_id uuid) RETURNS record
    LANGUAGE sql
    SET search_path TO 'public', 'pg_temp'
    AS $$
  select
    s.id,
    s.campaign_id,
    c.name as campaign_name,
    s.level,
    s.character_classes,
    s.school,
    s.casting_time,
    s.casting_time_value,
    s.duration,
    s.duration_value,
    s.range,
    s.range_value_imp,
    s.range_value_met,
    s.concentration,
    s.ritual,
    s.somatic,
    s.verbal,
    s.material,
    coalesce(tt.name, '{}'::jsonb)        as name,
    coalesce(tt.description, '{}'::jsonb) as description,
    coalesce(tt.materials, '{}'::jsonb)   as materials,
    coalesce(tt.page, '{}'::jsonb)        as page,
    coalesce(tt.upgrade, '{}'::jsonb)     as upgrade,
    s.visibility
  from public.spells s
  join public.campaigns c on c.id = s.campaign_id
  left join (
    select
      s.id,
      jsonb_object_agg(t.lang, t.name)        as name,
      jsonb_object_agg(t.lang, t.description) as description,
      jsonb_object_agg(t.lang, t.materials)   as materials,
      jsonb_object_agg(t.lang, t.page)        as page,
      jsonb_object_agg(t.lang, t.upgrade)     as upgrade
    from public.spells s
    left join public.spell_translations t on t.spell_id = s.id
    where s.id = p_id
    group by s.id
  ) tt on tt.id = s.id
  where s.id = p_id;
$$;

ALTER FUNCTION public.fetch_spell(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_spell(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_spell(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_spell(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH SPELLS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_spells(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text) RETURNS TABLE(id uuid, campaign_id uuid, campaign_name text, level smallint, character_classes public.character_class[], school public.spell_school, casting_time public.spell_casting_time, casting_time_value text, duration public.spell_duration, duration_value text, range public.spell_range, range_value_imp text, range_value_met text, concentration boolean, ritual boolean, somatic boolean, verbal boolean, material boolean, name jsonb, description jsonb, materials jsonb, page jsonb, upgrade jsonb, visibility public.campaign_role)
    LANGUAGE sql
    SET search_path TO 'public', 'pg_temp'
    AS $$
with prefs as (
  select
    -- levels
    (
      select coalesce(array_agg((e.key)::int), null)
      from jsonb_each_text(p_filters->'levels') as e(key, value)
      where e.value = 'true'
    ) as levels_inc,
    (
      select coalesce(array_agg((e.key)::int), null)
      from jsonb_each_text(p_filters->'levels') as e(key, value)
      where e.value = 'false'
    ) as levels_exc,

    -- classes
    (
      select coalesce(array_agg(lower(e.key)::public.character_class), null)
      from jsonb_each_text(p_filters->'character_classes') as e(key, value)
      where e.value = 'true'
    ) as classes_inc,
    (
      select coalesce(array_agg(lower(e.key)::public.character_class), null)
      from jsonb_each_text(p_filters->'character_classes') as e(key, value)
      where e.value = 'false'
    ) as classes_exc,

    -- schools
    (
      select coalesce(array_agg(lower(e.key)::public.spell_school), null)
      from jsonb_each_text(p_filters->'schools') as e(key, value)
      where e.value = 'true'
    ) as schools_inc,
    (
      select coalesce(array_agg(lower(e.key)::public.spell_school), null)
      from jsonb_each_text(p_filters->'schools') as e(key, value)
      where e.value = 'false'
    ) as schools_exc,

    -- boolean flags; null = not relevant
    (p_filters ? 'concentration')::int::boolean as has_conc_filter,
    (p_filters->>'concentration')::boolean      as conc_val,

    (p_filters ? 'ritual')::int::boolean        as has_rit_filter,
    (p_filters->>'ritual')::boolean             as rit_val,

    (p_filters ? 'material')::int::boolean      as has_mat_filter,
    (p_filters->>'material')::boolean           as mat_val,

    (p_filters ? 'somatic')::int::boolean       as has_som_filter,
    (p_filters->>'somatic')::boolean            as som_val,

    (p_filters ? 'verbal')::int::boolean        as has_ver_filter,
    (p_filters->>'verbal')::boolean             as ver_val
),
src as (
  select s.*
  from public.spells s
  join public.campaigns c on c.id = s.campaign_id
  where s.campaign_id = p_campaign_id
),
filtered as (
  select s.*
  from src s, prefs p
  where
    -- levels
        (p.levels_inc is null or s.level = any(p.levels_inc))
    and (p.levels_exc is null or not (s.level = any(p.levels_exc)))

    -- classes
    and (p.classes_inc is null or s.character_classes && p.classes_inc)
    and (p.classes_exc is null or not (s.character_classes && p.classes_exc))

    -- schools
    and (p.schools_inc is null or s.school = any(p.schools_inc))
    and (p.schools_exc is null or not (s.school = any(p.schools_exc)))

    -- flags
    and (not p.has_conc_filter or s.concentration = p.conc_val)
    and (not p.has_rit_filter  or s.ritual        = p.rit_val)
    and (not p.has_mat_filter  or s.material      = p.mat_val)
    and (not p.has_som_filter  or s.somatic       = p.som_val)
    and (not p.has_ver_filter  or s.verbal        = p.ver_val)
),
t as (
  select
    f.id,
    jsonb_object_agg(t.lang, t.name)                                                                                as name,
    jsonb_object_agg(t.lang, t.description) filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as description,
    jsonb_object_agg(t.lang, t.materials)   filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as materials,
    jsonb_object_agg(t.lang, t.page)        filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as page,
    jsonb_object_agg(t.lang, t.upgrade)     filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as upgrade
  from filtered f
  left join public.spell_translations t on t.spell_id = f.id
  left join (select 1) _ on true  -- keep p_langs in scope
  group by f.id
)
select
  f.id,
  f.campaign_id,
  c.name                                  as campaign_name,
  f.level,
  f.character_classes,
  f.school,
  f.casting_time,
  f.casting_time_value,
  f.duration,
  f.duration_value,
  f.range,
  f.range_value_imp,
  f.range_value_met,
  f.concentration,
  f.ritual,
  f.somatic,
  f.verbal,
  f.material,
  coalesce(tt.name, '{}'::jsonb)          as name,
  coalesce(tt.description, '{}'::jsonb)   as description,
  coalesce(tt.materials, '{}'::jsonb)     as materials,
  coalesce(tt.page, '{}'::jsonb)          as page,
  coalesce(tt.upgrade, '{}'::jsonb)       as upgrade,
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
  end desc nulls last,
  case
    when p_order_by = 'level' and p_order_dir = 'asc'
      then f.level
  end asc nulls last,
  case
    when p_order_by = 'level' and p_order_dir = 'desc'
      then f.level
  end desc nulls last;
$$;

ALTER FUNCTION public.fetch_spells(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_spells(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_spells(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_spells(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT SPELL TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_spell_translation(p_id uuid, p_lang text, p_spell_translation jsonb) RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  r public.spell_translations%ROWTYPE;
begin
  r := jsonb_populate_record(null::public.spell_translations, p_spell_translation);

  insert into public.spell_translations as st (
    spell_id, lang, name, page,
    materials, description, upgrade
  ) values (
    p_id, p_lang, r.name, r.page,
    r.materials, r.description, r.upgrade
  )
  on conflict (spell_id, lang) do update
  set
    name = excluded.name,
    page = excluded.page,
    materials = excluded.materials,
    description = excluded.description,
    upgrade = excluded.upgrade;
end;
$$;

ALTER FUNCTION public.upsert_spell_translation(p_id uuid, p_lang text, p_spell_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_spell_translation(p_id uuid, p_lang text, p_spell_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_spell_translation(p_id uuid, p_lang text, p_spell_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_spell_translation(p_id uuid, p_lang text, p_spell_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE SPELL
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_spell(p_id uuid, p_lang text, p_spell jsonb, p_spell_translation jsonb) RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_rows int;
begin
  update public.spells s
  set (
    level, school, character_classes, casting_time, casting_time_value,
    duration, duration_value, range, range_value_imp, range_value_met,
    concentration, ritual, verbal, somatic, material, visibility
  ) = (
    select r.level, r.school, r.character_classes, r.casting_time, r.casting_time_value,
           r.duration, r.duration_value, r.range, r.range_value_imp, r.range_value_met,
           r.concentration, r.ritual, r.verbal, r.somatic, r.material, r.visibility
    from jsonb_populate_record(null::public.spells, to_jsonb(s) || p_spell) as r
  )
  where s.id = p_id;

  get diagnostics v_rows = ROW_COUNT;
  if v_rows = 0 then
    raise exception 'No row with id %', p_id;
  end if;

  perform public.upsert_spell_translation(p_id, p_lang, p_spell_translation);
end;
$$;

ALTER FUNCTION public.update_spell(p_id uuid, p_lang text, p_spell jsonb, p_spell_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_spell(p_id uuid, p_lang text, p_spell jsonb, p_spell_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_spell(p_id uuid, p_lang text, p_spell jsonb, p_spell_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_spell(p_id uuid, p_lang text, p_spell jsonb, p_spell_translation jsonb) TO service_role;
