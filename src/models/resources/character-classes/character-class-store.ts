import { createResourceStore } from "../resource-store";
import { characterClassSchema, defaultCharacterClass } from "./character-class";
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
    orderOptions: characterClassOrderOptions,
    resourceSchema: characterClassSchema,
    useLocalizeResource: useLocalizeCharacterClass,
  },
);
