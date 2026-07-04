import z from "zod";
import { armorModifierSchema } from "./armors/armor-modifier";
import { localizedArmorModifierSchema } from "./armors/localized-armor-modifier";
import { itemModifierSchema } from "./items/item-modifier";
import { localizedItemModifierSchema } from "./items/localized-item-modifier";
import { localizedToolModifierSchema } from "./tools/localized-tool-modifier";
import { toolModifierSchema } from "./tools/tool-modifier";
import { localizedWeaponModifierSchema } from "./weapons/localized-weapon-modifier";
import { weaponModifierSchema } from "./weapons/weapon-modifier";

//------------------------------------------------------------------------------
// Equipment Modifier Union
//------------------------------------------------------------------------------

export const equipmentModifierUnionSchema = z.discriminatedUnion("kind", [
  armorModifierSchema,
  itemModifierSchema,
  toolModifierSchema,
  weaponModifierSchema,
]);

export type EquipmentModifierUnion = z.infer<
  typeof equipmentModifierUnionSchema
>;

//------------------------------------------------------------------------------
// Localized Equipment Modifier Union
//------------------------------------------------------------------------------

export const localizedEquipmentModifierUnionSchema = z.discriminatedUnion(
  "kind",
  [
    localizedArmorModifierSchema,
    localizedItemModifierSchema,
    localizedToolModifierSchema,
    localizedWeaponModifierSchema,
  ],
);

export type LocalizedEquipmentModifierUnion = z.infer<
  typeof localizedEquipmentModifierUnionSchema
>;
