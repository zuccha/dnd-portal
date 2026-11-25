import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
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
  description: i18nStringSchema,
  kind: z.literal("npc"),
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
  description: {},
  kind: "npc",
};

//------------------------------------------------------------------------------
// NPC Translation Fields
//------------------------------------------------------------------------------

export const npcTranslationFields: TranslationFields<Npc>[] = [
  ...resourceTranslationFields,
  "description",
];
