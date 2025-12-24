import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Armor Type
//------------------------------------------------------------------------------

export const armorTypeSchema = z.enum(["light", "medium", "heavy", "shield"]);

export const armorTypes = armorTypeSchema.options;

export type ArmorType = z.infer<typeof armorTypeSchema>;

//------------------------------------------------------------------------------
// Armor Type Translation Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useArmorTypeOptions,
  useTranslate: useTranslateArmorType,
  useTranslations: useArmorTypeTranslations,
} = createTypeTranslationHooks(armorTypes, {
  heavy: { en: "Heavy", it: "Pesante" },
  light: { en: "Light", it: "Leggera" },
  medium: { en: "Medium", it: "Media" },
  shield: { en: "Shield", it: "Scudo" },
});
