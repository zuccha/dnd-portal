import z from "zod";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";

//------------------------------------------------------------------------------
// DB Vehicle
//------------------------------------------------------------------------------

export const dbVehicleSchema = dbResourceSchema.extend({
  ac: z.number(),
  cargo: z.number(),
  cost: z.number(),
  crew_capacity: z.number(),
  damage_threshold: z.number(),
  hp: z.number(),
  passenger_capacity: z.number(),
  speed: z.number(),
});

export type DBVehicle = z.infer<typeof dbVehicleSchema>;

//------------------------------------------------------------------------------
// DB Vehicle Translation
//------------------------------------------------------------------------------

export const dbVehicleTranslationSchema = dbResourceTranslationSchema.extend({
  description: z.string(),
});

export type DBVehicleTranslation = z.infer<typeof dbVehicleTranslationSchema>;
