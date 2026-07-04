import z from "zod";
import { armorSchema } from "./armors/armor";
import { localizedArmorSchema } from "./armors/localized-armor";
import { itemSchema } from "./items/item";
import { localizedItemSchema } from "./items/localized-item";
import { localizedToolSchema } from "./tools/localized-tool";
import { toolSchema } from "./tools/tool";
import { localizedWeaponSchema } from "./weapons/localized-weapon";
import { weaponSchema } from "./weapons/weapon";

//------------------------------------------------------------------------------
// Equipment Union
//------------------------------------------------------------------------------

export const equipmentUnionSchema = z.discriminatedUnion("kind", [
  armorSchema,
  itemSchema,
  toolSchema,
  weaponSchema,
]);

export type EquipmentUnion = z.infer<typeof equipmentUnionSchema>;

//------------------------------------------------------------------------------
// Localized Equipment Union
//------------------------------------------------------------------------------

export const localizedEquipmentUnionSchema = z.discriminatedUnion("kind", [
  localizedArmorSchema,
  localizedItemSchema,
  localizedToolSchema,
  localizedWeaponSchema,
]);

export type LocalizedEquipmentUnion = z.infer<
  typeof localizedEquipmentUnionSchema
>;
