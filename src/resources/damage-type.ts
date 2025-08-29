import { z } from "zod";

//------------------------------------------------------------------------------
// Damage Type
//------------------------------------------------------------------------------

export const damageTypeSchema = z.enum([
  "acid",
  "bludgeoning",
  "cold",
  "fire",
  "force",
  "lightning",
  "necrotic",
  "piercing",
  "poison",
  "psychic",
  "radiant",
  "slashing",
  "thunder",
]);

export const damageTypes = damageTypeSchema.options;

export type DamageType = z.infer<typeof damageTypeSchema>;
