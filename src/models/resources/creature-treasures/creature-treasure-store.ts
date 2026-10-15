import { createResourceStore } from "../resource-store";
import { creatureTreasureTranslationFields, defaultCreatureTreasure } from "./creature-treasure";
import {
  creatureTreasureFiltersSchema,
  creatureTreasureOrderOptions,
  defaultCreatureTreasureFilters,
} from "./creature-treasure-filters";
import {
  localizeCreatureTreasure,
  useCreatureTreasureLocalizationContext,
} from "./localized-creature-treasure";

//------------------------------------------------------------------------------
// Creature Treasure Store
//------------------------------------------------------------------------------

export const creatureTreasureStore = createResourceStore("creature_treasure", {
  defaultFilters: defaultCreatureTreasureFilters,
  defaultResource: defaultCreatureTreasure,
  displayName: { en: "Treasures", it: "Tesori" },
  filtersSchema: creatureTreasureFiltersSchema,
  orderOptions: creatureTreasureOrderOptions,
  translationFields: creatureTreasureTranslationFields,
  localizeResource: localizeCreatureTreasure,
  useLocalizationContext: useCreatureTreasureLocalizationContext,
});
