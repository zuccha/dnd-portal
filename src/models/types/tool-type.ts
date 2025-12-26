import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Tool Type
//------------------------------------------------------------------------------

export const toolTypeSchema = z.enum(["artisan", "other"]);

export const toolTypes = toolTypeSchema.options;

export type ToolType = z.infer<typeof toolTypeSchema>;

//------------------------------------------------------------------------------
// Tool Type Translation Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useToolTypeOptions,
  useTranslate: useTranslateToolType,
  useTranslations: useToolTypeTranslations,
} = createTypeTranslationHooks(toolTypes, {
  artisan: { en: "Artisan", it: "Artigiano" },
  other: { en: "Other", it: "Altro" },
});
