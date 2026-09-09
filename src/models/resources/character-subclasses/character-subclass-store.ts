import { matchesInclusion } from "../resource-filtering";
import { createResourceStore } from "../resource-store";
import {
  characterSubclassSchema,
  characterSubclassTranslationFields,
  defaultCharacterSubclass,
} from "./character-subclass";
import {
  characterSubclassFiltersSchema,
  characterSubclassOrderOptions,
  defaultCharacterSubclassFilters,
} from "./character-subclass-filters";
import { useLocalizeCharacterSubclass } from "./localized-character-subclass";

//------------------------------------------------------------------------------
// Character Subclass Store
//------------------------------------------------------------------------------

export const characterSubclassStore = createResourceStore(
  "character_subclass",
  {
    defaultFilters: defaultCharacterSubclassFilters,
    defaultResource: defaultCharacterSubclass,
    displayName: { en: "Subclasses", it: "Sottoclassi" },
    filtersSchema: characterSubclassFiltersSchema,
    matchesResource: (characterSubclass, filters) =>
      matchesInclusion(
        characterSubclass.character_class_id,
        filters.character_class_ids,
      ),
    orderOptions: characterSubclassOrderOptions,
    resourceSchema: characterSubclassSchema,
    translationFields: characterSubclassTranslationFields,
    useLocalizeResource: useLocalizeCharacterSubclass,
  },
);
