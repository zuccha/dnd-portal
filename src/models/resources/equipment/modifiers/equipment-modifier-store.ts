import { createResourceStore } from "../../resource-store";
import {
  defaultEquipmentModifier,
  equipmentModifierSchema,
  equipmentModifierTranslationFields,
} from "./equipment-modifier";
import {
  defaultEquipmentModifierFilters,
  equipmentModifierFiltersSchema,
  equipmentModifierOrderOptions,
} from "./equipment-modifier-filters";
import { useLocalizeEquipmentModifier } from "./localized-equipment-modifier";

//------------------------------------------------------------------------------
// Equipment Modifier Store
//------------------------------------------------------------------------------

export const equipmentModifierStore = createResourceStore(
  { p: "equipment_modifiers", s: "equipment_modifier" },
  {
    defaultFilters: defaultEquipmentModifierFilters,
    defaultResource: defaultEquipmentModifier,
    filtersSchema: equipmentModifierFiltersSchema,
    kinds: ["equipment_modifier"],
    orderOptions: equipmentModifierOrderOptions,
    resourceSchema: equipmentModifierSchema,
    translationFields: equipmentModifierTranslationFields,
    useLocalizeResource: useLocalizeEquipmentModifier,
  },
);
