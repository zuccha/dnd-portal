import { z } from "zod";

//------------------------------------------------------------------------------
// Weapon Mastery
//------------------------------------------------------------------------------

export const weaponMasterySchema = z.enum([
  "cleave",
  "graze",
  "nick",
  "push",
  "sap",
  "slow",
  "topple",
  "vex",
]);

export const weaponMasteries = weaponMasterySchema.options;

export type WeaponMastery = z.infer<typeof weaponMasterySchema>;
