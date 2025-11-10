-- Fix typo in creature_skill enum: sleigh_of_hand -> sleight_of_hand
ALTER TYPE "public"."creature_skill" RENAME VALUE 'sleigh_of_hand' TO 'sleight_of_hand';
