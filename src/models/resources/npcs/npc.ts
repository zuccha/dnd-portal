import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { chronicleDateSchema } from "~/models/other/chronicle-date";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// NPC
//------------------------------------------------------------------------------

export const npcSchema = resourceSchema.extend({
  creature_id: z.uuid().nullable().default(null),
  date_of_birth: chronicleDateSchema.nullable().default(null),
  date_of_death: chronicleDateSchema.nullable().default(null),
  description: i18nStringSchema,
  kind: z.literal("npc"),
  species_id: z.uuid().nullable().default(null),
});

//------------------------------------------------------------------------------
// NPC Type
//------------------------------------------------------------------------------

export type Npc = z.infer<typeof npcSchema>;

//------------------------------------------------------------------------------
// Default NPC
//------------------------------------------------------------------------------

export const defaultNpc: Npc = {
  ...defaultResource,
  creature_id: null,
  date_of_birth: null,
  date_of_death: null,
  description: {},
  kind: "npc",
  species_id: null,
};

//------------------------------------------------------------------------------
// NPC Translation Fields
//------------------------------------------------------------------------------

export const npcTranslationFields: TranslationFields<Npc>[] = [
  ...resourceTranslationFields,
  "description",
];
