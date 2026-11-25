import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Faction Type
//------------------------------------------------------------------------------

export const factionTypeSchema = z.enum([
  "clan",
  "guild",
  "house",
  "military",
  "organization",
  "other",
  "religion",
  "state",
]);

//------------------------------------------------------------------------------
// Faction Types
//------------------------------------------------------------------------------

export const factionTypes = factionTypeSchema.options;

//------------------------------------------------------------------------------
// Faction Type
//------------------------------------------------------------------------------

export type FactionType = z.infer<typeof factionTypeSchema>;

//------------------------------------------------------------------------------
// Faction Type Hooks
//------------------------------------------------------------------------------

export const { useSortedOptions: useFactionTypeOptions, useTranslate: useTranslateFactionType } =
  createTypeTranslationHooks(factionTypes, {
    clan: { en: "Clan", it: "Clan" },
    guild: { en: "Guild", it: "Gilda" },
    house: { en: "House", it: "Casata" },
    military: { en: "Military", it: "Forze Armate" },
    organization: { en: "Organization", it: "Organizzazione" },
    other: { en: "Other Faction", it: "Altra Fazione" },
    religion: { en: "Religion", it: "Religione" },
    state: { en: "State", it: "Stato" },
  });
