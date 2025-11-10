-- Add page field to creature_translations table
ALTER TABLE "public"."creature_translations"
ADD COLUMN "page" "text";

-- Add page field to eldritch_invocation_translations table
ALTER TABLE "public"."eldritch_invocation_translations"
ADD COLUMN "page" "text";
