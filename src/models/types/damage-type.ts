import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

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
// Damage Type Hooks
//------------------------------------------------------------------------------

export const {
  useSortedOptions: useDamageTypeOptions,
  useTranslate: useTranslateDamageType,
  useTranslations: useDamageTypeTranslations,
} = createTypeTranslationHooks(damageTypes, {
  acid: { en: "Acid", it: "Acido" },
  bludgeoning: { en: "Bludgeoning", it: "Contundente" },
  cold: { en: "Cold", it: "Freddo" },
  fire: { en: "Fire", it: "Fuoco" },
  force: { en: "Force", it: "Forza" },
  lightning: { en: "Lightning", it: "Fulmine" },
  necrotic: { en: "Necrotic", it: "Necrotico" },
  piercing: { en: "Piercing", it: "Perforante" },
  poison: { en: "Poison", it: "Veleno" },
  psychic: { en: "Psychic", it: "Psichico" },
  radiant: { en: "Radiant", it: "Radioso" },
  slashing: { en: "Slashing", it: "Tagliente" },
  thunder: { en: "Thunder", it: "Tuono" },
});
