import { z } from "zod";
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
  useOptions: useSourceVersionOptions,
  useTranslate: useTranslateSourceVersion,
  useTranslations: useSourceVersionTranslations,
} = createTypeTranslationHooks(sourceVersions, {
  dnd5_0: { en: "D&D 5.0", it: "D&D 5.0" },
  dnd5_5: { en: "D&D 5.5", it: "D&D 5.5" },
});
