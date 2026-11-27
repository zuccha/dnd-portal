import z from "zod";
import { chronicleDateSchema } from "~/models/other/chronicle-date";
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
  date_of_birth: chronicleDateSchema.nullable().default(null),
  date_of_death: chronicleDateSchema.nullable().default(null),
  description: z.string().default(""),
  species_id: z.uuid().nullable().default(null),
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
    date_of_birth: data.date_of_birth,
    date_of_death: data.date_of_death,
    description: createResourceFormDataI18nValue(data.description, lang),
    species_id: data.species_id,
  });
}

//------------------------------------------------------------------------------
// NPC Form
//------------------------------------------------------------------------------

export const npcForm = createForm("npc", npcFormDataSchema.parse);
