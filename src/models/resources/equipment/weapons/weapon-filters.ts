import z from "zod";
import { weaponMasterySchema } from "../../../types/weapon-mastery";
import { weaponPropertySchema } from "../../../types/weapon-property";
import { weaponTypeSchema } from "../../../types/weapon-type";
import { equipmentFiltersSchema } from "../equipment-filters";

//------------------------------------------------------------------------------
// Weapon Filters
//------------------------------------------------------------------------------

export const weaponFiltersSchema = equipmentFiltersSchema.extend({
  masteries: z
    .partialRecord(weaponMasterySchema, z.boolean().optional())
    .optional(),
  properties: z
    .partialRecord(weaponPropertySchema, z.boolean().optional())
    .optional(),
  types: z.partialRecord(weaponTypeSchema, z.boolean().optional()).optional(),

  melee: z.boolean().optional(),
  ranged: z.boolean().optional(),
});

export type WeaponFilters = z.infer<typeof weaponFiltersSchema>;

//------------------------------------------------------------------------------
// Default Weapon Filters
//------------------------------------------------------------------------------

export const defaultWeaponFilters: WeaponFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
