import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Tool Type
//------------------------------------------------------------------------------

export const toolTypeSchema = z.enum([
  "artisan",
  "gaming_set",
  "musical_instrument",
  "other",
]);

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
  gaming_set: { en: "Gaming Set", it: "Gioco" },
  musical_instrument: { en: "Musical Instrument", it: "Strumento Musicale" },
  other: { en: "Other Tools", it: "Altri Strumenti" },
});
