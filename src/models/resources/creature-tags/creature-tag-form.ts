import z from "zod";
import { createForm } from "~/utils/form";
import { resourceFormDataSchema, resourceFormDataToResource } from "../resource-form";
import type { CreatureTag } from "./creature-tag";

//------------------------------------------------------------------------------
// Creature Tag Form Data
//------------------------------------------------------------------------------

export const creatureTagFormDataSchema = resourceFormDataSchema.extend({});

export type CreatureTagFormData = z.infer<typeof creatureTagFormDataSchema>;

//------------------------------------------------------------------------------
// Creature Tag Form Data To Resource
//------------------------------------------------------------------------------

export function creatureTagFormDataToResource(
  data: Partial<CreatureTagFormData>,
  lang: string,
): Partial<CreatureTag> {
  return resourceFormDataToResource(data, lang);
}

//------------------------------------------------------------------------------
// Creature Tag Form
//------------------------------------------------------------------------------

export const creatureTagForm = createForm("creature_tag", creatureTagFormDataSchema.parse);
