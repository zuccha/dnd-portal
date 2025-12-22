import { z } from "zod";
import type { I18nLang } from "./i18n-lang";

//------------------------------------------------------------------------------
// I18n Number
//------------------------------------------------------------------------------

export const i18nNumberSchema = z.record(z.string(), z.number().nullish());

export type I18nNumber = z.infer<typeof i18nNumberSchema>;

//------------------------------------------------------------------------------
// Translate
//------------------------------------------------------------------------------

export function translateNumber(
  i18nNumber: I18nNumber,
  lang: I18nLang,
  fallback: number = 0,
): number {
  return i18nNumber[lang] ?? fallback;
}
