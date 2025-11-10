-- Add NOT NULL constraint to weapons.magic field
-- First, update any existing NULL values to false (default)
UPDATE "public"."weapons"
SET "magic" = false
WHERE "magic" IS NULL;

-- Then add the NOT NULL constraint
ALTER TABLE "public"."weapons"
ALTER COLUMN "magic" SET NOT NULL;
