import { createEquipmentStore } from "../equipment-store";
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

export const armorStore = createEquipmentStore(
  { p: "armors", s: "armor" },
  {
    defaultEquipment: defaultArmor,
    defaultFilters: defaultArmorFilters,
    equipmentSchema: armorSchema,
    filtersSchema: armorFiltersSchema,
    kinds: ["armor"],
    orderOptions: armorOrderOptions,
    translationFields: armorTranslationFields,
    useLocalizeEquipment: useLocalizeArmor,
  },
);
