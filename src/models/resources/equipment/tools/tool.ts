import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { creatureAbilitySchema } from "../../../types/creature-ability";
import { toolTypeSchema } from "../../../types/tool-type";
import type { TranslationFields } from "../../resource";
import {
  defaultEquipment,
  equipmentSchema,
  equipmentTranslationFields,
} from "../equipment";

//------------------------------------------------------------------------------
// Tool
//------------------------------------------------------------------------------

export const toolSchema = equipmentSchema.extend({
  ability: creatureAbilitySchema,
  craft: i18nStringSchema,
  type: toolTypeSchema,
  utilize: i18nStringSchema,
});

export type Tool = z.infer<typeof toolSchema>;

//------------------------------------------------------------------------------
// Default Tool
//------------------------------------------------------------------------------

export const defaultTool: Tool = {
  ...defaultEquipment,
  ability: "strength",
  craft: {},
  type: "other",
  utilize: {},
};

//------------------------------------------------------------------------------
// Tool Translation Fields
//------------------------------------------------------------------------------

export const toolTranslationFields: TranslationFields<Tool>[] = [
  ...equipmentTranslationFields,
  "craft",
  "utilize",
];
