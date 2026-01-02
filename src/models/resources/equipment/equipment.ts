import z from "zod";
import type { I18nNumber } from "~/i18n/i18n-number";
import { type I18nString, i18nStringSchema } from "~/i18n/i18n-string";
import type { KeysOfType } from "~/types";
import { resourceSchema, resourceTranslationFields } from "../resource";

//------------------------------------------------------------------------------
// Equipment
//------------------------------------------------------------------------------

export const equipmentSchema = resourceSchema.extend({
  cost: z.number(),
  magic: z.boolean(),
  notes: i18nStringSchema,
  weight: z.number(),
});

export type Equipment = z.infer<typeof equipmentSchema>;

//------------------------------------------------------------------------------
// Default Equipment
//------------------------------------------------------------------------------

export const defaultEquipment: Equipment = {
  id: "",

  campaign_id: "",
  campaign_name: "",

  visibility: "game_master",

  name: {},
  page: {},

  cost: 0,
  magic: false,
  notes: {},
  weight: 0,
};

//------------------------------------------------------------------------------
// Equipment Translation Fields
//------------------------------------------------------------------------------

export const equipmentTranslationFields: KeysOfType<
  Equipment,
  I18nNumber | I18nString
>[] = [...resourceTranslationFields, "notes"];
