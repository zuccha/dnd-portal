import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Item Type
//------------------------------------------------------------------------------

export const itemTypeSchema = z.enum([
  "drawn_vehicle",
  "other",
  "poison",
  "potion",
  "ring",
  "rod",
  "scroll",
  "staff",
  "wand",
]);

export const itemTypes = itemTypeSchema.options;

export type ItemType = z.infer<typeof itemTypeSchema>;

//------------------------------------------------------------------------------
// Item Type Translation Hooks
//------------------------------------------------------------------------------

export const {
  useSortedOptions: useItemTypeOptions,
  useTranslate: useTranslateItemType,
  useTranslations: useItemTypeTranslations,
} = createTypeTranslationHooks(itemTypes, {
  drawn_vehicle: { en: "Drawn Vehicle", it: "Veicolo da Traino" },
  other: { en: "Generic", it: "Generico" },
  poison: { en: "Poison", it: "Veleno" },
  potion: { en: "Potion", it: "Pozione" },
  ring: { en: "Ring", it: "Anello" },
  rod: { en: "Rod", it: "Verga" },
  scroll: { en: "Scroll", it: "Pergamena" },
  staff: { en: "Staff", it: "Bastone" },
  wand: { en: "Wand", it: "Bacchetta" },
});
