import { createResourceStore } from "../resource-store";
import { defaultCharacterClass } from "./character-class";
import {
  characterClassFiltersSchema,
  characterClassOrderOptions,
  defaultCharacterClassFilters,
} from "./character-class-filters";
import { useLocalizeCharacterClass } from "./localized-character-class";

//------------------------------------------------------------------------------
// Character Class Store
//------------------------------------------------------------------------------

export const characterClassStore = createResourceStore("character_class", {
  defaultFilters: defaultCharacterClassFilters,
  defaultResource: defaultCharacterClass,
  displayName: { en: "Classes", it: "Classi" },
  filtersSchema: characterClassFiltersSchema,
  orderOptions: characterClassOrderOptions,
  useLocalizeResource: useLocalizeCharacterClass,
});
