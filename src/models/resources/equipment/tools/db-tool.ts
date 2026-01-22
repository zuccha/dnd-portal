import z from "zod";
import { creatureAbilitySchema } from "../../../types/creature-ability";
import { toolTypeSchema } from "../../../types/tool-type";
import {
  dbEquipmentSchema,
  dbEquipmentTranslationSchema,
} from "../db-equipment";

//------------------------------------------------------------------------------
// DB Tool
//------------------------------------------------------------------------------

export const dbToolSchema = dbEquipmentSchema.extend({
  ability: creatureAbilitySchema,
  craft_ids: z.array(z.uuid()),
  type: toolTypeSchema,
});

export type DBTool = z.infer<typeof dbToolSchema>;

//------------------------------------------------------------------------------
// DB Tool Translation
//------------------------------------------------------------------------------

export const dbToolTranslationSchema = dbEquipmentTranslationSchema.extend({
  utilize: z.string(),
});

export type DBToolTranslation = z.infer<typeof dbToolTranslationSchema>;
