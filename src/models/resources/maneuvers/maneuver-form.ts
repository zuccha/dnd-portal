import z from "zod";
import { createForm } from "~/utils/form";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { Maneuver } from "./maneuver";

//------------------------------------------------------------------------------
// Maneuver Form Data
//------------------------------------------------------------------------------

export const maneuverFormDataSchema = resourceFormDataSchema.extend({
  description: z.string().default(""),
  name: z.string().default(""),
  page: z.number().default(0),
  prerequisite: z.string().default(""),
});

export type ManeuverFormData = z.infer<typeof maneuverFormDataSchema>;

//------------------------------------------------------------------------------
// Maneuver Form Data To Resource
//------------------------------------------------------------------------------

export function maneuverFormDataToResource(
  data: Partial<ManeuverFormData>,
  lang: string,
): Partial<Maneuver> {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    description: createResourceFormDataI18nValue(data.description, lang),
    prerequisite: createResourceFormDataI18nValue(data.prerequisite, lang),
  });
}

//------------------------------------------------------------------------------
// Maneuver Form
//------------------------------------------------------------------------------

export const maneuverForm = createForm("maneuver", maneuverFormDataSchema.parse);
