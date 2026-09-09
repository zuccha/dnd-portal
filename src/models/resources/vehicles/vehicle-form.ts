import z from "zod";
import { createForm } from "~/utils/form";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { Vehicle } from "./vehicle";

//------------------------------------------------------------------------------
// Vehicle Form Data
//------------------------------------------------------------------------------

export const vehicleFormDataSchema = resourceFormDataSchema.extend({
  ac: z.number().int().min(0).default(0),
  cargo: z.number().int().min(0).default(0),
  cost: z.number().int().min(0).default(0),
  crew_capacity: z.number().int().min(0).default(0),
  damage_threshold: z.number().int().min(0).default(0),
  description: z.string().default(""),
  hp: z.number().int().min(0).default(0),
  name: z.string().default(""),
  page: z.number().default(0),
  passenger_capacity: z.number().int().min(0).default(0),
  speed: z.number().int().min(0).default(0),
});

export type VehicleFormData = z.infer<typeof vehicleFormDataSchema>;

//------------------------------------------------------------------------------
// Vehicle Form Data To Resource
//------------------------------------------------------------------------------

export function vehicleFormDataToResource(
  data: Partial<VehicleFormData>,
  lang: string,
): Partial<Vehicle> {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    ac: data.ac,
    cargo: data.cargo,
    cost: data.cost,
    crew_capacity: data.crew_capacity,
    damage_threshold: data.damage_threshold,
    description: createResourceFormDataI18nValue(data.description, lang),
    hp: data.hp,
    passenger_capacity: data.passenger_capacity,
    speed: data.speed,
  });
}

//------------------------------------------------------------------------------
// Vehicle Form
//------------------------------------------------------------------------------

export const vehicleForm = createForm("vehicle", vehicleFormDataSchema.parse);
