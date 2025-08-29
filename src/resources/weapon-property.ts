import { z } from "zod";

//------------------------------------------------------------------------------
// Weapon Property
//------------------------------------------------------------------------------

export const weaponPropertySchema = z.enum([
  "ammunition",
  "finesse",
  "heavy",
  "light",
  "loading",
  "range",
  "reach",
  "throw",
  "two-handed",
  "versatile",
]);

export const weaponPropertys = weaponPropertySchema.options;

export type WeaponProperty = z.infer<typeof weaponPropertySchema>;
