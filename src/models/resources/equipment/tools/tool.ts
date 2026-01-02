import z from "zod";
import type { I18nNumber } from "~/i18n/i18n-number";
import { type I18nString, i18nStringSchema } from "~/i18n/i18n-string";
import type { KeysOfType } from "~/types";
import { creatureAbilitySchema } from "../../../types/creature-ability";
import { toolTypeSchema } from "../../../types/tool-type";
import { equipmentSchema, equipmentTranslationFields } from "../equipment";

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
  id: "",

  campaign_id: "",
  campaign_name: "",

  visibility: "game_master",

  name: {},
  page: {},

  cost: 0,
  magic: false,
  weight: 0,

  notes: {},

  ability: "strength",
  type: "other",

  craft: {},
  utilize: {},
};

//------------------------------------------------------------------------------
// Tool Translation Fields
//------------------------------------------------------------------------------

export const toolTranslationFields: KeysOfType<
  Tool,
  I18nNumber | I18nString
>[] = [...equipmentTranslationFields, "craft", "utilize"];
