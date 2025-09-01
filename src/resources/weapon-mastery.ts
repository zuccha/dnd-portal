import { useMemo } from "react";
import { z } from "zod";
import { compareObjects } from "../utils/object";
import { createTypeTranslationHooks } from "./type";

//------------------------------------------------------------------------------
// Weapon Mastery
//------------------------------------------------------------------------------

export const weaponMasterySchema = z.enum([
  "cleave",
  "graze",
  "nick",
  "push",
  "sap",
  "slow",
  "topple",
  "vex",
]);

export const weaponMasteries = weaponMasterySchema.options;

export type WeaponMastery = z.infer<typeof weaponMasterySchema>;

//------------------------------------------------------------------------------
// Weapon Mastery Translation
//------------------------------------------------------------------------------

export const weaponMasteryTranslationSchema = z.object({
  label: z.string().default(""),
  lang: z.string().default("en"),
  weapon_mastery: weaponMasterySchema,
});

export type WeaponMasteryTranslation = z.infer<
  typeof weaponMasteryTranslationSchema
>;

//------------------------------------------------------------------------------
// Weapon Mastery Hooks
//------------------------------------------------------------------------------

export const {
  useTranslate: useTranslateWeaponMastery,
  useTranslations: useWeaponMasteryTranslations,
} = createTypeTranslationHooks(
  "weapon_mastery",
  weaponMasteries,
  weaponMasteryTranslationSchema
);

//------------------------------------------------------------------------------
// Use Weapon Mastery Options
//------------------------------------------------------------------------------

export function useWeaponMasteryOptions() {
  const weaponMasteryTranslations = useWeaponMasteryTranslations();

  return useMemo(
    () =>
      weaponMasteryTranslations
        .map(({ weapon_mastery, label }) => ({ label, value: weapon_mastery }))
        .sort(compareObjects("label")),
    [weaponMasteryTranslations]
  );
}
