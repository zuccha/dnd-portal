import { z } from "zod";
import { createLocalStore } from "~/store/local-store";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Source Version
//------------------------------------------------------------------------------

export const sourceVersionSchema = z.enum(["dnd5_0", "dnd5_5"]);

export const sourceVersions = sourceVersionSchema.options;

export type SourceVersion = z.infer<typeof sourceVersionSchema>;

//------------------------------------------------------------------------------
// Source Version Translation Hooks
//------------------------------------------------------------------------------

export const {
  useShortOptions: useSourceVersionOptions,
  useTranslate: useTranslateSourceVersion,
  useTranslations: useSourceVersionTranslations,
} = createTypeTranslationHooks(
  sourceVersions,
  {
    dnd5_0: { en: "D&D 5.0", it: "D&D 5.0" },
    dnd5_5: { en: "D&D 5.5", it: "D&D 5.5" },
  },
  {
    dnd5_0: { en: "5.0", it: "5.0" },
    dnd5_5: { en: "5.5", it: "5.5" },
  },
);

//------------------------------------------------------------------------------
// Use Selected Source Version
//------------------------------------------------------------------------------

export const useSelectedSourceVersion = createLocalStore<SourceVersion[]>(
  "sources.selected_version",
  sourceVersions,
  z.array(sourceVersionSchema).parse,
).use;
