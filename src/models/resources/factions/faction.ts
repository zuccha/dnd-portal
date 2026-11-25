import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { factionTypeSchema } from "../../types/faction-type";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Faction
//------------------------------------------------------------------------------

export const factionSchema = resourceSchema.extend({
  description: i18nStringSchema,
  kind: z.literal("faction"),
  type: factionTypeSchema,
});

//------------------------------------------------------------------------------
// Faction Type
//------------------------------------------------------------------------------

export type Faction = z.infer<typeof factionSchema>;

//------------------------------------------------------------------------------
// Default Faction
//------------------------------------------------------------------------------

export const defaultFaction: Faction = {
  ...defaultResource,
  description: {},
  kind: "faction",
  type: "organization",
};

//------------------------------------------------------------------------------
// Faction Translation Fields
//------------------------------------------------------------------------------

export const factionTranslationFields: TranslationFields<Faction>[] = [
  ...resourceTranslationFields,
  "description",
];
