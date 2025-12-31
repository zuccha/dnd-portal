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
  useSortedShortOptions: useDamageTypeOptions,
  useTranslate: useTranslateDamageType,
  useTranslations: useDamageTypeTranslations,
} = createTypeTranslationHooks(
  damageTypes,
  {
    acid: { en: "Acid", it: "da Acido" },
    bludgeoning: { en: "Bludgeoning", it: "Contundenti" },
    cold: { en: "Cold", it: "da Freddo" },
    fire: { en: "Fire", it: "da Fuoco" },
    force: { en: "Force", it: "da Forza" },
    lightning: { en: "Lightning", it: "da Fulmine" },
    necrotic: { en: "Necrotic", it: "Necrotici" },
    piercing: { en: "Piercing", it: "Perforanti" },
    poison: { en: "Poison", it: "da Veleno" },
    psychic: { en: "Psychic", it: "Psichici" },
    radiant: { en: "Radiant", it: "Radiosi" },
    slashing: { en: "Slashing", it: "Taglienti" },
    thunder: { en: "Thunder", it: "da Tuono" },
  },
  {
    acid: { en: "Acid", it: "Acido" },
    bludgeoning: { en: "Bludgeoning", it: "Contundenti" },
    cold: { en: "Cold", it: "Freddo" },
    fire: { en: "Fire", it: "Fuoco" },
    force: { en: "Force", it: "Forza" },
    lightning: { en: "Lightning", it: "Fulmine" },
    necrotic: { en: "Necrotic", it: "Necrotici" },
    piercing: { en: "Piercing", it: "Perforanti" },
    poison: { en: "Poison", it: "Veleno" },
    psychic: { en: "Psychic", it: "Psichici" },
    radiant: { en: "Radiant", it: "Radiosi" },
    slashing: { en: "Slashing", it: "Taglienti" },
    thunder: { en: "Thunder", it: "Tuono" },
  },
);
