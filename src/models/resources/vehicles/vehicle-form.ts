import z from "zod";
import { createForm } from "~/utils/form";
import { resourceFormDataSchema, resourceFormDataToDB } from "../resource-form";
import { type DBVehicle, type DBVehicleTranslation } from "./db-vehicle";

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
// Vehicle Form Data To DB
//------------------------------------------------------------------------------

export function vehicleFormDataToDB(data: Partial<VehicleFormData>): {
  resource: Partial<DBVehicle>;
  translation: Partial<DBVehicleTranslation>;
} {
  const { resource, translation } = resourceFormDataToDB(data);

  return {
    resource: {
      ...resource,
      ac: data.ac,
      cargo: data.cargo,
      cost: data.cost,
      crew_capacity: data.crew_capacity,
      damage_threshold: data.damage_threshold,
      hp: data.hp,
      passenger_capacity: data.passenger_capacity,
      speed: data.speed,
    },
    translation: {
      ...translation,
      description: data.description,
    },
  };
}

//------------------------------------------------------------------------------
// Vehicle Form
//------------------------------------------------------------------------------

export const vehicleForm = createForm("vehicle", vehicleFormDataSchema.parse);
