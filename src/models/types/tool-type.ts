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
  artisan: { en: "Artisan's Tool", it: "Strumento da Artigiano" },
  other: { en: "Other Tools", it: "Altri Strumenti" },
});
