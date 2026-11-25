import z from "zod";
import { createForm } from "~/utils/form";
import { factionTypeSchema } from "../../types/faction-type";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { Faction } from "./faction";

//------------------------------------------------------------------------------
// Faction Form Data
//------------------------------------------------------------------------------

export const factionFormDataSchema = resourceFormDataSchema.extend({
  description: z.string().default(""),
  type: factionTypeSchema.default("organization"),
});

//------------------------------------------------------------------------------
// Faction Form Data Type
//------------------------------------------------------------------------------

export type FactionFormData = z.infer<typeof factionFormDataSchema>;

//------------------------------------------------------------------------------
// Faction Form Data To Resource
//------------------------------------------------------------------------------

export function factionFormDataToResource(
  data: Partial<FactionFormData>,
  lang: string,
): Partial<Faction> {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    description: createResourceFormDataI18nValue(data.description, lang),
    type: data.type,
  });
}

//------------------------------------------------------------------------------
// Faction Form
//------------------------------------------------------------------------------

export const factionForm = createForm("faction", factionFormDataSchema.parse);
