--------------------------------------------------------------------------------
-- WEAPONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "public"."weapons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "campaign_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "damage" "text" DEFAULT ''::"text" NOT NULL,
    "damage_versatile" "text",
    "damage_type" "public"."damage_type" NOT NULL,
    "properties" "public"."weapon_property"[] NOT NULL,
    "mastery" "public"."weapon_mastery" NOT NULL,
    "melee" boolean NOT NULL,
    "ranged" boolean NOT NULL,
    "magic" boolean NOT NULL,
    "range_ft_short" real,
    "range_ft_long" real,
    "range_m_short" real,
    "range_m_long" real,
    "weight_lb" real NOT NULL,
    "weight_kg" real NOT NULL,
    "cost" real NOT NULL,
    "visibility" "public"."campaign_role" DEFAULT 'player'::"public"."campaign_role" NOT NULL,
    "type" "public"."weapon_type" NOT NULL,
    CONSTRAINT "weapons_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "weapons_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "weapons_damage_versatile_check" CHECK ((("damage_versatile" IS NOT NULL) = ("properties" @> ARRAY['versatile'::"public"."weapon_property"]))),
    CONSTRAINT "weapons_ranged_range_check" CHECK (("ranged" = (("range_ft_short" IS NOT NULL) AND ("range_ft_long" IS NOT NULL) AND ("range_m_short" IS NOT NULL) AND ("range_m_long" IS NOT NULL))))
);

ALTER TABLE "public"."weapons" OWNER TO "postgres";
ALTER TABLE "public"."weapons" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."weapons" TO "anon";
GRANT ALL ON TABLE "public"."weapons" TO "authenticated";
GRANT ALL ON TABLE "public"."weapons" TO "service_role";


--------------------------------------------------------------------------------
-- WEAPON TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "public"."weapon_translations" (
    "weapon_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lang" "text" NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "page" "text",
    "notes" "text",
    "ammunition" "text",
    CONSTRAINT "weapon_translations_pkey" PRIMARY KEY ("weapon_id", "lang"),
    CONSTRAINT "weapon_translations_weapon_id_fkey" FOREIGN KEY ("weapon_id") REFERENCES "public"."weapons"("id") ON UPDATE CASCADE ON DELETE CASCADE
    -- TODO: CONSTRAINT "weapon_translations_lang_fkey" FOREIGN KEY ("lang") REFERENCES "public"."languages"("code") ON DELETE CASCADE
);

ALTER TABLE "public"."weapon_translations" OWNER TO "postgres";
ALTER TABLE "public"."weapon_translations" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."weapon_translations" TO "anon";
GRANT ALL ON TABLE "public"."weapon_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."weapon_translations" TO "service_role";


--------------------------------------------------------------------------------
-- WEAPONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read weapons" ON "public"."weapons" FOR SELECT TO "authenticated" USING (
  EXISTS (
    SELECT 1 FROM "public"."campaigns" "c"
    LEFT JOIN "public"."user_modules" "um" ON ("um"."module_id" = "c"."id" AND "um"."user_id" = ( SELECT "auth"."uid"() AS "uid"))
    LEFT JOIN "public"."campaign_players" "cp" ON ("cp"."campaign_id" = "c"."id" AND "cp"."user_id" = ( SELECT "auth"."uid"() AS "uid"))
    WHERE "c"."id" = "weapons"."campaign_id"
      AND (
        -- Public modules
        ("c"."is_module" = true AND "c"."visibility" = 'public'::"public"."campaign_visibility")
        OR
        -- Owned modules
        ("c"."is_module" = true AND "um"."user_id" IS NOT NULL)
        OR
        -- Non-module campaigns with visibility check
        ("c"."is_module" = false AND "cp"."user_id" IS NOT NULL AND (
          "weapons"."visibility" = 'player'::"public"."campaign_role"
          OR "cp"."role" = 'game_master'::"public"."campaign_role"
        ))
      )
  )
);

CREATE POLICY "Creators and GMs can edit weapons" ON "public"."weapons" TO "authenticated" USING (
  EXISTS (
    SELECT 1 FROM "public"."campaigns" "c"
    LEFT JOIN "public"."user_modules" "um" ON ("um"."module_id" = "c"."id" AND "um"."user_id" = ( SELECT "auth"."uid"() AS "uid") AND "um"."role" = 'creator'::"public"."module_role")
    LEFT JOIN "public"."campaign_players" "cp" ON ("cp"."campaign_id" = "c"."id" AND "cp"."user_id" = ( SELECT "auth"."uid"() AS "uid") AND "cp"."role" = 'game_master'::"public"."campaign_role")
    WHERE "c"."id" = "weapons"."campaign_id"
      AND (
        -- Module creators
        ("c"."is_module" = true AND "um"."user_id" IS NOT NULL)
        OR
        -- Campaign GMs
        ("c"."is_module" = false AND "cp"."user_id" IS NOT NULL)
      )
  )
);


--------------------------------------------------------------------------------
-- WEAPON TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read weapon translations" ON "public"."weapon_translations" FOR SELECT TO "authenticated" USING (
  EXISTS (
    SELECT 1 FROM "public"."weapons" "w"
    JOIN "public"."campaigns" "c" ON "c"."id" = "w"."campaign_id"
    LEFT JOIN "public"."user_modules" "um" ON ("um"."module_id" = "c"."id" AND "um"."user_id" = ( SELECT "auth"."uid"() AS "uid"))
    LEFT JOIN "public"."campaign_players" "cp" ON ("cp"."campaign_id" = "c"."id" AND "cp"."user_id" = ( SELECT "auth"."uid"() AS "uid"))
    WHERE "w"."id" = "weapon_translations"."weapon_id"
      AND (
        -- Public modules
        ("c"."is_module" = true AND "c"."visibility" = 'public'::"public"."campaign_visibility")
        OR
        -- Owned modules
        ("c"."is_module" = true AND "um"."user_id" IS NOT NULL)
        OR
        -- Non-module campaigns with visibility check
        ("c"."is_module" = false AND "cp"."user_id" IS NOT NULL AND (
          "w"."visibility" = 'player'::"public"."campaign_role"
          OR "cp"."role" = 'game_master'::"public"."campaign_role"
        ))
      )
  )
);

CREATE POLICY "Creators and GMs can edit weapon translations" ON "public"."weapon_translations" TO "authenticated" USING (
  EXISTS (
    SELECT 1 FROM "public"."weapons" "w"
    JOIN "public"."campaigns" "c" ON "c"."id" = "w"."campaign_id"
    LEFT JOIN "public"."user_modules" "um" ON ("um"."module_id" = "c"."id" AND "um"."user_id" = ( SELECT "auth"."uid"() AS "uid") AND "um"."role" = 'creator'::"public"."module_role")
    LEFT JOIN "public"."campaign_players" "cp" ON ("cp"."campaign_id" = "c"."id" AND "cp"."user_id" = ( SELECT "auth"."uid"() AS "uid") AND "cp"."role" = 'game_master'::"public"."campaign_role")
    WHERE "w"."id" = "weapon_translations"."weapon_id"
      AND (
        -- Module creators
        ("c"."is_module" = true AND "um"."user_id" IS NOT NULL)
        OR
        -- Campaign GMs
        ("c"."is_module" = false AND "cp"."user_id" IS NOT NULL)
      )
  )
);


--------------------------------------------------------------------------------
-- CREATE WEAPON
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION "public"."create_weapon"("p_campaign_id" "uuid", "p_lang" "text", "p_weapon" "jsonb", "p_weapon_translation" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  v_id uuid;
  r public.weapons%ROWTYPE;
begin
  r := jsonb_populate_record(null::public.weapons, p_weapon);

  insert into public.weapons (
    campaign_id, type, damage, damage_versatile, damage_type,
    properties, mastery, melee, ranged, magic,
    range_ft_short, range_ft_long, range_m_short, range_m_long,
    weight_kg, weight_lb, cost, visibility
  ) values (
    p_campaign_id, r.type, r.damage, r.damage_versatile, r.damage_type,
    r.properties, r.mastery, r.melee, r.ranged, r.magic,
    r.range_ft_short, r.range_ft_long, r.range_m_short, r.range_m_long,
    r.weight_kg, r.weight_lb, r.cost, r.visibility
  )
  returning id into v_id;

  perform public.upsert_weapon_translation(v_id, p_lang, p_weapon_translation);

  return v_id;
end;
$$;


ALTER FUNCTION "public"."create_weapon"("p_campaign_id" "uuid", "p_lang" "text", "p_weapon" "jsonb", "p_weapon_translation" "jsonb") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."create_weapon"("p_campaign_id" "uuid", "p_lang" "text", "p_weapon" "jsonb", "p_weapon_translation" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_weapon"("p_campaign_id" "uuid", "p_lang" "text", "p_weapon" "jsonb", "p_weapon_translation" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_weapon"("p_campaign_id" "uuid", "p_lang" "text", "p_weapon" "jsonb", "p_weapon_translation" "jsonb") TO "service_role";


--------------------------------------------------------------------------------
-- FETCH WEAPON
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION "public"."fetch_weapon"("p_id" "uuid") RETURNS "record"
    LANGUAGE "sql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select
    w.id,
    w.campaign_id,
    c.name as campaign_name,
    w.type,
    w.damage,
    w.damage_type,
    w.damage_versatile,
    w.mastery,
    w.properties,
    w.magic,
    w.melee,
    w.ranged,
    w.range_ft_long,
    w.range_ft_short,
    w.range_m_long,
    w.range_m_short,
    w.weight_kg,
    w.weight_lb,
    w.cost,
    coalesce(tt.name,       '{}'::jsonb)  as name,
    coalesce(tt.notes,      '{}'::jsonb)  as notes,
    coalesce(tt.page,       '{}'::jsonb)  as page,
    coalesce(tt.ammunition, '{}'::jsonb)  as ammunition,
    w.visibility
  from public.weapons w
  join public.campaigns c on c.id = w.campaign_id
  left join (
    select
      w.id,
      jsonb_object_agg(t.lang, t.name)        as name,
      jsonb_object_agg(t.lang, t.notes)       as notes,
      jsonb_object_agg(t.lang, t.page)        as page,
      jsonb_object_agg(t.lang, t.ammunition)  as ammunition
    from public.weapons w
    left join public.weapon_translations t on t.weapon_id = w.id
    where w.id = p_id
    group by w.id
  ) tt on tt.id = w.id
  where w.id = p_id;
$$;

ALTER FUNCTION "public"."fetch_weapon"("p_id" "uuid") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."fetch_weapon"("p_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_weapon"("p_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_weapon"("p_id" "uuid") TO "service_role";


--------------------------------------------------------------------------------
-- FETCH WEAPONS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION "public"."fetch_weapons"("p_campaign_id" "uuid", "p_langs" "text"[], "p_filters" "jsonb" DEFAULT '{}'::"jsonb", "p_order_by" "text" DEFAULT 'name'::"text", "p_order_dir" "text" DEFAULT 'asc'::"text") RETURNS TABLE("id" "uuid", "campaign_id" "uuid", "campaign_name" "text", "type" "public"."weapon_type", "damage" "text", "damage_type" "public"."damage_type", "damage_versatile" "text", "mastery" "public"."weapon_mastery", "properties" "public"."weapon_property"[], "magic" boolean, "melee" boolean, "ranged" boolean, "range_ft_long" real, "range_ft_short" real, "range_m_long" real, "range_m_short" real, "weight_kg" real, "weight_lb" real, "cost" real, "name" "jsonb", "notes" "jsonb", "page" "jsonb", "ammunition" "jsonb", "visibility" "public"."campaign_role")
    LANGUAGE "sql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
with prefs as (
  select
    -- types
    (
      select coalesce(array_agg((e.key)::public.weapon_type), null)
      from jsonb_each_text(p_filters->'types') as e(key, value)
      where e.value = 'true'
    ) as types_inc,
    (
      select coalesce(array_agg((e.key)::public.weapon_type), null)
      from jsonb_each_text(p_filters->'types') as e(key, value)
      where e.value = 'false'
    ) as types_exc,

    -- properties
    (
      select coalesce(array_agg(lower(e.key)::public.weapon_property), null)
      from jsonb_each_text(p_filters->'weapon_properties') as e(key, value)
      where e.value = 'true'
    ) as properties_inc,
    (
      select coalesce(array_agg(lower(e.key)::public.weapon_property), null)
      from jsonb_each_text(p_filters->'weapon_properties') as e(key, value)
      where e.value = 'false'
    ) as properties_exc,

    -- mastery
    (
      select coalesce(array_agg(lower(e.key)::public.weapon_mastery), null)
      from jsonb_each_text(p_filters->'masteries') as e(key, value)
      where e.value = 'true'
    ) as masteries_inc,
    (
      select coalesce(array_agg(lower(e.key)::public.weapon_mastery), null)
      from jsonb_each_text(p_filters->'masteries') as e(key, value)
      where e.value = 'false'
    ) as masteries_exc,

    -- boolean flags; null = not relevant
    (p_filters ? 'magic')::int::boolean   as has_magic_filter,
    (p_filters->>'magic')::boolean        as magic_val,

    (p_filters ? 'melee')::int::boolean   as has_melee_filter,
    (p_filters->>'melee')::boolean        as melee_val,

    (p_filters ? 'ranged')::int::boolean  as has_ranged_filter,
    (p_filters->>'ranged')::boolean       as ranged_val
),
src as (
  select w.*
  from public.weapons w
  join public.campaigns c on c.id = w.campaign_id
  where w.campaign_id = p_campaign_id
),
filtered as (
  select s.*
  from src s, prefs p
  where
    -- types
        (p.types_inc is null or s.type = any(p.types_inc))
    and (p.types_exc is null or not (s.type = any(p.types_exc)))

    -- properties
    and (p.properties_inc is null or s.properties && p.properties_inc)
    and (p.properties_exc is null or not (s.properties && p.properties_exc))

    -- masteries
    and (p.masteries_inc is null or s.mastery = any(p.masteries_inc))
    and (p.masteries_exc is null or not (s.mastery = any(p.masteries_exc)))

    -- flags
    and (not p.has_magic_filter  or s.magic  = p.magic_val)
    and (not p.has_melee_filter  or s.melee  = p.melee_val)
    and (not p.has_ranged_filter or s.ranged = p.ranged_val)
),
t as (
  select
    f.id,
    jsonb_object_agg(t.lang, t.name)                                                                                as name,
    jsonb_object_agg(t.lang, t.notes)       filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as notes,
    jsonb_object_agg(t.lang, t.page)        filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as page,
    jsonb_object_agg(t.lang, t.ammunition)  filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as ammunition
  from filtered f
  left join public.weapon_translations t on t.weapon_id = f.id
  left join (select 1) _ on true  -- keep p_langs in scope
  group by f.id
)
select
  f.id,
  f.campaign_id,
  c.name as campaign_name,
  f.type,
  f.damage,
  f.damage_type,
  f.damage_versatile,
  f.mastery,
  f.properties,
  f.magic,
  f.melee,
  f.ranged,
  f.range_ft_long,
  f.range_ft_short,
  f.range_m_long,
  f.range_m_short,
  f.weight_kg,
  f.weight_lb,
  f.cost,
  coalesce(tt.name,       '{}'::jsonb)  as name,
  coalesce(tt.notes,      '{}'::jsonb)  as notes,
  coalesce(tt.page,       '{}'::jsonb)  as page,
  coalesce(tt.ammunition, '{}'::jsonb)  as ammunition,
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

ALTER FUNCTION "public"."fetch_weapons"("p_campaign_id" "uuid", "p_langs" "text"[], "p_filters" "jsonb", "p_order_by" "text", "p_order_dir" "text") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."fetch_weapons"("p_campaign_id" "uuid", "p_langs" "text"[], "p_filters" "jsonb", "p_order_by" "text", "p_order_dir" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_weapons"("p_campaign_id" "uuid", "p_langs" "text"[], "p_filters" "jsonb", "p_order_by" "text", "p_order_dir" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_weapons"("p_campaign_id" "uuid", "p_langs" "text"[], "p_filters" "jsonb", "p_order_by" "text", "p_order_dir" "text") TO "service_role";


--------------------------------------------------------------------------------
-- UPSERT WEAPON TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION "public"."upsert_weapon_translation"("p_id" "uuid", "p_lang" "text", "p_weapon_translation" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  r public.weapon_translations%ROWTYPE;
begin
  r := jsonb_populate_record(null::public.weapon_translations, p_weapon_translation);

  insert into public.weapon_translations as st (
    weapon_id, lang, name, page,
    ammunition, notes
  ) values (
    p_id, p_lang, r.name, r.page,
    r.ammunition, r.notes
  )
  on conflict (weapon_id, lang) do update
  set
    name = excluded.name,
    page = excluded.page,
    ammunition = excluded.ammunition,
    notes = excluded.notes;
end;
$$;

ALTER FUNCTION "public"."upsert_weapon_translation"("p_id" "uuid", "p_lang" "text", "p_weapon_translation" "jsonb") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."upsert_weapon_translation"("p_id" "uuid", "p_lang" "text", "p_weapon_translation" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_weapon_translation"("p_id" "uuid", "p_lang" "text", "p_weapon_translation" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_weapon_translation"("p_id" "uuid", "p_lang" "text", "p_weapon_translation" "jsonb") TO "service_role";


--------------------------------------------------------------------------------
-- UPDATE WEAPON
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION "public"."update_weapon"("p_id" "uuid", "p_lang" "text", "p_weapon" "jsonb", "p_weapon_translation" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  v_rows int;
begin
  update public.weapons s
  set (
    type, damage, damage_versatile, damage_type,
    properties, mastery, melee, ranged, magic,
    range_ft_short, range_ft_long, range_m_short, range_m_long,
    weight_kg, weight_lb, cost, visibility
  ) = (
    select r.type, r.damage, r.damage_versatile, r.damage_type,
           r.properties, r.mastery, r.melee, r.ranged, r.magic,
           r.range_ft_short, r.range_ft_long, r.range_m_short, r.range_m_long,
           r.weight_kg, r.weight_lb, r.cost, r.visibility
    from jsonb_populate_record(null::public.weapons, to_jsonb(s) || p_weapon) as r
  )
  where s.id = p_id;

  get diagnostics v_rows = ROW_COUNT;
  if v_rows = 0 then
    raise exception 'No row with id %', p_id;
  end if;

  perform public.upsert_weapon_translation(p_id, p_lang, p_weapon_translation);
end;
$$;

ALTER FUNCTION "public"."update_weapon"("p_id" "uuid", "p_lang" "text", "p_weapon" "jsonb", "p_weapon_translation" "jsonb") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."update_weapon"("p_id" "uuid", "p_lang" "text", "p_weapon" "jsonb", "p_weapon_translation" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_weapon"("p_id" "uuid", "p_lang" "text", "p_weapon" "jsonb", "p_weapon_translation" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_weapon"("p_id" "uuid", "p_lang" "text", "p_weapon" "jsonb", "p_weapon_translation" "jsonb") TO "service_role";
