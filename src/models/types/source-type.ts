import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Source Type
//------------------------------------------------------------------------------

export const sourceTypeSchema = z.enum(["core", "module", "campaign"]);

export const sourceTypes = sourceTypeSchema.options;

export type SourceType = z.infer<typeof sourceTypeSchema>;

//------------------------------------------------------------------------------
// Source Type Translation Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useSourceTypeOptions,
  useTranslate: useTranslateSourceType,
  useTranslations: useSourceTypeTranslations,
} = createTypeTranslationHooks(sourceTypes, {
  campaign: { en: "Campaign", it: "Campagna" },
  core: { en: "Core", it: "Core" },
  module: { en: "Module", it: "Modulo" },
});
