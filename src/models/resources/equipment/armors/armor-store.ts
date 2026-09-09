import { matchesInclusion } from "../../resource-filtering";
import { createEquipmentStore, matchesEquipment } from "../equipment-store";
import { armorSchema, armorTranslationFields, defaultArmor } from "./armor";
import {
  armorFiltersSchema,
  armorOrderOptions,
  defaultArmorFilters,
} from "./armor-filters";
import { useLocalizeArmor } from "./localized-armor";

//------------------------------------------------------------------------------
// Armor Store
//------------------------------------------------------------------------------

export const armorStore = createEquipmentStore("armor", {
  defaultEquipment: defaultArmor,
  defaultFilters: defaultArmorFilters,
  displayName: { en: "Armors", it: "Armature" },
  equipmentSchema: armorSchema,
  filtersSchema: armorFiltersSchema,
  matchesEquipment: (armor, filters) =>
    matchesEquipment(armor, filters) &&
    matchesInclusion(armor.type, filters.types),
  orderOptions: armorOrderOptions,
  translationFields: armorTranslationFields,
  useLocalizeEquipment: useLocalizeArmor,
});
