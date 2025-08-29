import { z } from "zod";
import type { I18nLang } from "./i18n-lang";

//------------------------------------------------------------------------------
// I18n String
//------------------------------------------------------------------------------

export const i18nStringSchema = z.record(z.string(), z.string().nullable());

export type I18nString = z.infer<typeof i18nStringSchema>;

//------------------------------------------------------------------------------
// Translate
//------------------------------------------------------------------------------

export function translate(i18nString: I18nString, lang: I18nLang): string {
  return i18nString[lang] ?? i18nString["en"] ?? "";
}
