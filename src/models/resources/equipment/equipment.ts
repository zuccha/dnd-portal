import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { equipmentRaritySchema } from "../../types/equipment-rarity";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Equipment
//------------------------------------------------------------------------------

export const equipmentSchema = resourceSchema.extend({
  cost: z.number(),
  magic: z.boolean(),
  notes: i18nStringSchema,
  rarity: equipmentRaritySchema,
  weight: z.number(),
});

export type Equipment = z.infer<typeof equipmentSchema>;

//------------------------------------------------------------------------------
// Default Equipment
//------------------------------------------------------------------------------

export const defaultEquipment: Equipment = {
  ...defaultResource,
  cost: 0,
  magic: false,
  notes: {},
  rarity: "common",
  weight: 0,
};

//------------------------------------------------------------------------------
// Equipment Translation Fields
//------------------------------------------------------------------------------

export const equipmentTranslationFields: TranslationFields<Equipment>[] = [
  ...resourceTranslationFields,
  "notes",
];
