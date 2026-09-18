import { matchesInclusion } from "../../resource-filtering";
import { createEquipmentStore, matchesEquipment } from "../equipment-store";
import { armorTranslationFields, defaultArmor } from "./armor";
import { armorFiltersSchema, armorOrderOptions, defaultArmorFilters } from "./armor-filters";
import { localizeArmor, useArmorLocalizationContext } from "./localized-armor";

//------------------------------------------------------------------------------
// Armor Store
//------------------------------------------------------------------------------

export const armorStore = createEquipmentStore("armor", {
  defaultEquipment: defaultArmor,
  defaultFilters: defaultArmorFilters,
  displayName: { en: "Armors", it: "Armature" },
  filtersSchema: armorFiltersSchema,
  matchesEquipment: (armor, filters) =>
    matchesEquipment(armor, filters) && matchesInclusion(armor.type, filters.types),
  orderOptions: armorOrderOptions,
  translationFields: armorTranslationFields,
  localizeEquipment: localizeArmor,
  useEquipmentLocalizationContext: useArmorLocalizationContext,
});
