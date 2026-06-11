import z from "zod";
import { createForm } from "~/utils/form";
import { resourceFormDataSchema, resourceFormDataToDB } from "../resource-form";
import { type DBManeuver, type DBManeuverTranslation } from "./db-maneuver";

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
// Maneuver Form Data To DB
//------------------------------------------------------------------------------

export function maneuverFormDataToDB(data: Partial<ManeuverFormData>): {
  resource: Partial<DBManeuver>;
  translation: Partial<DBManeuverTranslation>;
} {
  const { resource, translation } = resourceFormDataToDB(data);

  return {
    resource,
    translation: {
      ...translation,
      description: data.description,
      prerequisite: data.prerequisite,
    },
  };
}

//------------------------------------------------------------------------------
// Maneuver Form
//------------------------------------------------------------------------------

export const maneuverForm = createForm(
  "maneuver",
  maneuverFormDataSchema.parse,
);
