import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Deity Domain
//------------------------------------------------------------------------------

export const deityDomainSchema = z.enum([
  "death",
  "knowledge",
  "life",
  "light",
  "nature",
  "none",
  "tempest",
  "trickery",
  "war",
]);

//------------------------------------------------------------------------------
// Deity Domains
//------------------------------------------------------------------------------

export const deityDomains = deityDomainSchema.options;

//------------------------------------------------------------------------------
// Deity Domain
//------------------------------------------------------------------------------

export type DeityDomain = z.infer<typeof deityDomainSchema>;

//------------------------------------------------------------------------------
// Deity Domain Hooks
//------------------------------------------------------------------------------

export const { useSortedOptions: useDeityDomainOptions, useTranslate: useTranslateDeityDomain } =
  createTypeTranslationHooks(deityDomains, {
    death: { en: "Death", it: "Morte" },
    knowledge: { en: "Knowledge", it: "Conoscenza" },
    life: { en: "Life", it: "Vita" },
    light: { en: "Light", it: "Luce" },
    nature: { en: "Nature", it: "Natura" },
    none: { en: "No Domain", it: "Senza Dominio" },
    tempest: { en: "Tempest", it: "Tempesta" },
    trickery: { en: "Trickery", it: "Inganno" },
    war: { en: "War", it: "Guerra" },
  });
