import { z } from "zod";
import type { I18nLang } from "./i18n-lang";

//------------------------------------------------------------------------------
// I18n String
//------------------------------------------------------------------------------

export const i18nStringSchema = z.record(z.string(), z.string().nullish());

export type I18nString = z.infer<typeof i18nStringSchema>;

//------------------------------------------------------------------------------
// Translate
//------------------------------------------------------------------------------

export function translate(
  i18nString: I18nString,
  lang: I18nLang,
  fallback: string = "",
): string {
  return i18nString[lang] ?? fallback;
}

//------------------------------------------------------------------------------
// Append I18n String
//------------------------------------------------------------------------------

export function appendI18nString(
  base: I18nString,
  delta: I18nString,
  separator = "",
): I18nString {
  const langs = new Set([...Object.keys(base), ...Object.keys(delta)]);
  const result: I18nString = {};

  for (const lang of langs) {
    const baseText = base[lang] ?? "";
    const deltaText = delta[lang] ?? "";
    result[lang] =
      baseText && deltaText ? `${baseText}${separator}${deltaText}`
      : baseText ? baseText
      : deltaText || undefined;
  }

  return result;
}

//------------------------------------------------------------------------------
// Compose I18n String
//------------------------------------------------------------------------------

export function composeI18nString(
  template: I18nString,
  base: I18nString,
  key: string,
): I18nString {
  const langs = new Set([...Object.keys(base), ...Object.keys(template)]);
  const result: I18nString = {};

  for (const lang of langs) {
    const baseText = base[lang] ?? "";
    const templateText = template[lang] ?? key;
    result[lang] = templateText.replaceAll(key, baseText);
  }

  return result;
}
