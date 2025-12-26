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
  heavy: { en: "Heavy Armor", it: "Armatura Pesante" },
  light: { en: "Light Armor", it: "Armatura Leggera" },
  medium: { en: "Medium Armor", it: "Armatura Media" },
  shield: { en: "Shield", it: "Scudo" },
});
