import z from "zod";
import type { I18nNumber } from "~/i18n/i18n-number";
import type { I18nString } from "~/i18n/i18n-string";
import type { KeysOfType } from "~/types";
import { equipmentSchema, equipmentTranslationFields } from "../equipment";

//------------------------------------------------------------------------------
// Item
//------------------------------------------------------------------------------

export const itemSchema = equipmentSchema.extend({});

export type Item = z.infer<typeof itemSchema>;

//------------------------------------------------------------------------------
// Default Item
//------------------------------------------------------------------------------

export const defaultItem: Item = {
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
};

//------------------------------------------------------------------------------
// Item Translation Fields
//------------------------------------------------------------------------------

export const itemTranslationFields: KeysOfType<
  Item,
  I18nNumber | I18nString
>[] = [...equipmentTranslationFields];
