import { matchesInclusion } from "../resource-filtering";
import { createResourceStore } from "../resource-store";
import { characterSubclassTranslationFields, defaultCharacterSubclass } from "./character-subclass";
import {
  characterSubclassFiltersSchema,
  characterSubclassOrderOptions,
  defaultCharacterSubclassFilters,
} from "./character-subclass-filters";
import {
  localizeCharacterSubclass,
  useCharacterSubclassLocalizationContext,
} from "./localized-character-subclass";

//------------------------------------------------------------------------------
// Character Subclass Store
//------------------------------------------------------------------------------

const characterSubclassResourceStore = createResourceStore("character_subclass", {
  defaultFilters: defaultCharacterSubclassFilters,
  defaultResource: defaultCharacterSubclass,
  displayName: { en: "Subclasses", it: "Sottoclassi" },
  filtersSchema: characterSubclassFiltersSchema,
  matchesResource: (characterSubclass, filters) =>
    matchesInclusion(characterSubclass.character_class_id, filters.character_class_ids),
  orderOptions: characterSubclassOrderOptions,
  translationFields: characterSubclassTranslationFields,
  localizeResource: localizeCharacterSubclass,
  useLocalizationContext: useCharacterSubclassLocalizationContext,
});

export const characterSubclassStore = characterSubclassResourceStore;
