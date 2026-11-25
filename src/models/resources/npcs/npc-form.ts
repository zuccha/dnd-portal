import z from "zod";
import { createForm } from "~/utils/form";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { Npc } from "./npc";

//------------------------------------------------------------------------------
// NPC Form Data
//------------------------------------------------------------------------------

export const npcFormDataSchema = resourceFormDataSchema.extend({
  creature_id: z.uuid().nullable().default(null),
  description: z.string().default(""),
});

//------------------------------------------------------------------------------
// NPC Form Data Type
//------------------------------------------------------------------------------

export type NpcFormData = z.infer<typeof npcFormDataSchema>;

//------------------------------------------------------------------------------
// NPC Form Data To Resource
//------------------------------------------------------------------------------

export function npcFormDataToResource(data: Partial<NpcFormData>, lang: string): Partial<Npc> {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    creature_id: data.creature_id,
    description: createResourceFormDataI18nValue(data.description, lang),
  });
}

//------------------------------------------------------------------------------
// NPC Form
//------------------------------------------------------------------------------

export const npcForm = createForm("npc", npcFormDataSchema.parse);
