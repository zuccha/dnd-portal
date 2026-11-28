import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Relic Type
//------------------------------------------------------------------------------

export const relicTypeSchema = z.enum([
  "artifact",
  "artwork",
  "container",
  "document",
  "jewelry",
  "monument",
  "other",
  "utensil",
]);

//------------------------------------------------------------------------------
// Relic Types
//------------------------------------------------------------------------------

export const relicTypes = relicTypeSchema.options;

//------------------------------------------------------------------------------
// Relic Type
//------------------------------------------------------------------------------

export type RelicType = z.infer<typeof relicTypeSchema>;

//------------------------------------------------------------------------------
// Relic Type Hooks
//------------------------------------------------------------------------------

export const { useSortedOptions: useRelicTypeOptions, useTranslate: useTranslateRelicType } =
  createTypeTranslationHooks(relicTypes, {
    artifact: { en: "Artifact", it: "Artefatto" },
    artwork: { en: "Artwork", it: "Opera d'Arte" },
    container: { en: "Container", it: "Contenitore" },
    document: { en: "Document", it: "Documento" },
    jewelry: { en: "Jewelry", it: "Gioiello" },
    monument: { en: "Monument", it: "Monumento" },
    other: { en: "Other Relic", it: "Altra Reliquia" },
    utensil: { en: "Utensil", it: "Utensile" },
  });
