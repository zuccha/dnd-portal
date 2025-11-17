--------------------------------------------------------------------------------
-- CAMPAIGNS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "public"."campaigns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "core" boolean DEFAULT false NOT NULL,
    CONSTRAINT "campaign_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."campaigns" OWNER TO "postgres";


ALTER TABLE "public"."campaigns" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."campaigns" TO "anon";
GRANT ALL ON TABLE "public"."campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."campaigns" TO "service_role";


--------------------------------------------------------------------------------
-- CAMPAIGN PLAYERS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "public"."campaign_players" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "campaign_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role" "public"."campaign_role" DEFAULT 'player'::"public"."campaign_role" NOT NULL,
    CONSTRAINT "campaign_players_pkey" PRIMARY KEY ("campaign_id", "user_id"),
    CONSTRAINT "campaign_players_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "campaign_players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE "public"."campaign_players" OWNER TO "postgres";

CREATE INDEX "idx_campaign_players_user_id" ON "public"."campaign_players" USING "btree" ("user_id");

ALTER TABLE "public"."campaign_players" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."campaign_players" TO "anon";
GRANT ALL ON TABLE "public"."campaign_players" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_players" TO "service_role";


--------------------------------------------------------------------------------
-- CAMPAIGNS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Players can read campaigns they joined" ON "public"."campaigns" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."campaign_players" "cp"
  WHERE (("cp"."campaign_id" = "campaigns"."id") AND ("cp"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));

CREATE POLICY "Players can read core campaigns" ON "public"."campaigns" FOR SELECT USING (("core" = true));


--------------------------------------------------------------------------------
-- CAMPAIGN PLAYERS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can check if they joined a campaign" ON "public"."campaign_players" FOR SELECT TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));


--------------------------------------------------------------------------------
-- FETCH CAMPAIGN ROLE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION "public"."fetch_campaign_role"("p_campaign_id" "uuid") RETURNS "public"."campaign_role"
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select cp.role
  from public.campaign_players cp
  where cp.campaign_id = p_campaign_id
    and cp.user_id = auth.uid()
  limit 1;
$$;

ALTER FUNCTION "public"."fetch_campaign_role"("p_campaign_id" "uuid") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."fetch_campaign_role"("p_campaign_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_campaign_role"("p_campaign_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_campaign_role"("p_campaign_id" "uuid") TO "service_role";
