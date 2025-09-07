import { useMemo } from "react";
import { z } from "zod";
import { compareObjects } from "../utils/object";
import { createTypeTranslationHooks } from "./type";

//------------------------------------------------------------------------------
// Damage Type
//------------------------------------------------------------------------------

export const damageTypeSchema = z.enum([
  "acid",
  "bludgeoning",
  "cold",
  "fire",
  "force",
  "lightning",
  "necrotic",
  "piercing",
  "poison",
  "psychic",
  "radiant",
  "slashing",
  "thunder",
]);

export const damageTypes = damageTypeSchema.options;

export type DamageType = z.infer<typeof damageTypeSchema>;

//------------------------------------------------------------------------------
// Damage Type Translation
//------------------------------------------------------------------------------

export const damageTypeTranslationSchema = z.object({
  damage_type: damageTypeSchema,
  label: z.string().default(""),
  lang: z.string().default("en"),
});

export type damageTypeTranslation = z.infer<typeof damageTypeTranslationSchema>;

//------------------------------------------------------------------------------
// Damage Type Hooks
//------------------------------------------------------------------------------

export const {
  useTranslate: useTranslateDamageType,
  useTranslations: useDamageTypeTranslations,
} = createTypeTranslationHooks(
  "damage_type",
  damageTypes,
  damageTypeTranslationSchema
);

//------------------------------------------------------------------------------
// Use Damage Type Options
//------------------------------------------------------------------------------

export function useDamageTypeOptions() {
  const weaponMasteryTranslations = useDamageTypeTranslations();

  return useMemo(
    () =>
      weaponMasteryTranslations
        .map(({ damage_type, label }) => ({ label, value: damage_type }))
        .sort(compareObjects("label")),
    [weaponMasteryTranslations]
  );
}
