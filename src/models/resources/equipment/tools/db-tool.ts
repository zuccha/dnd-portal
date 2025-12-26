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
  type: toolTypeSchema,
});

export type DBTool = z.infer<typeof dbToolSchema>;

//------------------------------------------------------------------------------
// DB Tool Translation
//------------------------------------------------------------------------------

export const dbToolTranslationSchema = dbEquipmentTranslationSchema.extend({
  craft: z.string(),
  utilize: z.string(),
});

export type DBToolTranslation = z.infer<typeof dbToolTranslationSchema>;
