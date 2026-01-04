import { createResourceStore } from "../resource-store";
import {
  characterClassSchema,
  characterClassTranslationFields,
  defaultCharacterClass,
} from "./character-class";
import {
  characterClassFiltersSchema,
  characterClassOrderOptions,
  defaultCharacterClassFilters,
} from "./character-class-filters";
import { useLocalizeCharacterClass } from "./localized-character-class";

//------------------------------------------------------------------------------
// Character Class Store
//------------------------------------------------------------------------------

export const characterClassStore = createResourceStore(
  { p: "character_classes", s: "character_class" },
  {
    defaultFilters: defaultCharacterClassFilters,
    defaultResource: defaultCharacterClass,
    filtersSchema: characterClassFiltersSchema,
    kinds: ["character_class"],
    orderOptions: characterClassOrderOptions,
    resourceSchema: characterClassSchema,
    translationFields: characterClassTranslationFields,
    useLocalizeResource: useLocalizeCharacterClass,
  },
);
