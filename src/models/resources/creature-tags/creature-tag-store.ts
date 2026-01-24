import { createResourceStore } from "../resource-store";
import {
  creatureTagSchema,
  creatureTagTranslationFields,
  defaultCreatureTag,
} from "./creature-tag";
import {
  creatureTagFiltersSchema,
  creatureTagOrderOptions,
  defaultCreatureTagFilters,
} from "./creature-tag-filters";
import { useLocalizeCreatureTag } from "./localized-creature-tag";

//------------------------------------------------------------------------------
// Creature Tag Store
//------------------------------------------------------------------------------

export const creatureTagStore = createResourceStore(
  { p: "creature_tags", s: "creature_tag" },
  {
    defaultFilters: defaultCreatureTagFilters,
    defaultResource: defaultCreatureTag,
    filtersSchema: creatureTagFiltersSchema,
    kinds: ["creature_tag"],
    orderOptions: creatureTagOrderOptions,
    resourceSchema: creatureTagSchema,
    translationFields: creatureTagTranslationFields,
    useLocalizeResource: useLocalizeCreatureTag,
  },
);
