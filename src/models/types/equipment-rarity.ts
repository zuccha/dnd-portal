import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Equipment Rarity
//------------------------------------------------------------------------------

export const equipmentRaritySchema = z.enum([
  "common",
  "uncommon",
  "rare",
  "very_rare",
  "legendary",
  "artifact",
]);

export const equipmentRarities = equipmentRaritySchema.options;

export type EquipmentRarity = z.infer<typeof equipmentRaritySchema>;

//------------------------------------------------------------------------------
// Equipment Rarity Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useEquipmentRarityOptions,
  useTranslate: useTranslateEquipmentRarity,
  useTranslations: useEquipmentRarityTranslations,
} = createTypeTranslationHooks(equipmentRarities, {
  artifact: { en: "Artifact", it: "Manufatto" },
  common: { en: "Common", it: "Comune" },
  legendary: { en: "Legendary", it: "Leggendario" },
  rare: { en: "Rare", it: "Rara" },
  uncommon: { en: "Uncommon", it: "Non Comune" },
  very_rare: { en: "Very Rare", it: "Molto Raro" },
});
