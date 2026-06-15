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
  ac: z.number(),
  cargo: z.number(),
  cost: z.number(),
  crew_capacity: z.number(),
  damage_threshold: z.number(),
  description: i18nStringSchema,
  hp: z.number(),
  passenger_capacity: z.number(),
  speed: z.number(),
});

export type Vehicle = z.infer<typeof vehicleSchema>;

//------------------------------------------------------------------------------
// Default Vehicle
//------------------------------------------------------------------------------

export const defaultVehicle: Vehicle = {
  ...defaultResource,
  ac: 0,
  cargo: 0,
  cost: 0,
  crew_capacity: 0,
  damage_threshold: 0,
  description: {},
  hp: 0,
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
