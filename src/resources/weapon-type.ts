import { z } from "zod";

//------------------------------------------------------------------------------
// Weapon Type
//------------------------------------------------------------------------------

export const weaponTypeSchema = z.enum(["simple", "martial"]);

export const weaponTypes = weaponTypeSchema.options;

export type WeaponType = z.infer<typeof weaponTypeSchema>;
