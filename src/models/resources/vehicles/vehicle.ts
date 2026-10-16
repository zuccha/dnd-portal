import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Vehicle
//------------------------------------------------------------------------------

export const vehicleSchema = resourceSchema.extend({
  armor_class: z.number(),
  cargo: z.number(),
  cost: z.number(),
  crew_capacity: z.number(),
  damage_threshold: z.number(),
  description: i18nStringSchema,
  hit_points: z.number(),
  kind: z.literal("vehicle"),
  passenger_capacity: z.number(),
  speed: z.number(),
});

export type Vehicle = z.infer<typeof vehicleSchema>;

//------------------------------------------------------------------------------
// Default Vehicle
//------------------------------------------------------------------------------

export const defaultVehicle: Vehicle = {
  ...defaultResource,
  armor_class: 0,
  cargo: 0,
  cost: 0,
  crew_capacity: 0,
  damage_threshold: 0,
  description: {},
  hit_points: 0,
  kind: "vehicle",
  passenger_capacity: 0,
  speed: 0,
};

//------------------------------------------------------------------------------
// Vehicle Translation Fields
//------------------------------------------------------------------------------

export const vehicleTranslationFields: TranslationFields<Vehicle>[] = [
  ...resourceTranslationFields,
  "description",
];
