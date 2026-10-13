import { createResourceStore } from "../resource-store";
import { defaultCreatureFamily, creatureFamilyTranslationFields } from "./creature-family";
import {
  creatureFamilyFiltersSchema,
  creatureFamilyOrderOptions,
  defaultCreatureFamilyFilters,
} from "./creature-family-filters";
import {
  localizeCreatureFamily,
  useCreatureFamilyLocalizationContext,
} from "./localized-creature-family";

//------------------------------------------------------------------------------
// Creature Family Store
//------------------------------------------------------------------------------

export const creatureFamilyStore = createResourceStore("creature_family", {
  defaultFilters: defaultCreatureFamilyFilters,
  defaultResource: defaultCreatureFamily,
  displayName: { en: "Creature Families", it: "Famiglie di creature" },
  filtersSchema: creatureFamilyFiltersSchema,
  matchesResource: () => true,
  orderOptions: creatureFamilyOrderOptions,
  translationFields: creatureFamilyTranslationFields,
  localizeResource: localizeCreatureFamily,
  useLocalizationContext: useCreatureFamilyLocalizationContext,
});
