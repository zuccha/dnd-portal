import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Maneuver
//------------------------------------------------------------------------------

export const maneuverSchema = resourceSchema.extend({
  description: i18nStringSchema,
  kind: z.literal("maneuver"),
  prerequisite: i18nStringSchema,
});

export type Maneuver = z.infer<typeof maneuverSchema>;

//------------------------------------------------------------------------------
// Default Maneuver
//------------------------------------------------------------------------------

export const defaultManeuver: Maneuver = {
  ...defaultResource,
  description: {},
  kind: "maneuver",
  prerequisite: {},
};

//------------------------------------------------------------------------------
// Maneuver Translation Fields
//------------------------------------------------------------------------------

export const maneuverTranslationFields: TranslationFields<Maneuver>[] = [
  ...resourceTranslationFields,
  "description",
  "prerequisite",
];
