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
  { p: "character_subclasses", s: "character_subclass" },
  {
    defaultFilters: defaultCharacterSubclassFilters,
    defaultResource: defaultCharacterSubclass,
    filtersSchema: characterSubclassFiltersSchema,
    kinds: ["character_subclass"],
    orderOptions: characterSubclassOrderOptions,
    resourceSchema: characterSubclassSchema,
    translationFields: characterSubclassTranslationFields,
    useLocalizeResource: useLocalizeCharacterSubclass,
  },
);
