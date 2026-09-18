import { createEquipmentModifierStore } from "../equipment-modifier-store";
import { localizeEquipmentModifier } from "../localized-equipment-modifier";
import { armorModifierTranslationFields, defaultArmorModifier } from "./armor-modifier";
import {
  armorModifierFiltersSchema,
  armorModifierOrderOptions,
  defaultArmorModifierFilters,
} from "./armor-modifier-filters";

//------------------------------------------------------------------------------
// Armor Modifier Store
//------------------------------------------------------------------------------

export const armorModifierStore = createEquipmentModifierStore("armor_modifier", {
  defaultFilters: defaultArmorModifierFilters,
  defaultModifier: defaultArmorModifier,
  displayName: { en: "Armor Variants", it: "Varianti delle Armature" },
  filtersSchema: armorModifierFiltersSchema,
  orderOptions: armorModifierOrderOptions,
  translationFields: armorModifierTranslationFields,
  localizeModifier: localizeEquipmentModifier,
});
