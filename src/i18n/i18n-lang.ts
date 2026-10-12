import { z } from "zod";
import { createLocalStore } from "~/store/local-store";
import { useI18nLangProviderContext } from "./i18n-lang-provider-context";
import type { I18nString } from "./i18n-string";

//------------------------------------------------------------------------------
// I18n Lang
//------------------------------------------------------------------------------

export type I18nLang = string;

//------------------------------------------------------------------------------
// I18n Lang Context
//------------------------------------------------------------------------------

export type I18nLangContext = Record<string, I18nString>;

//------------------------------------------------------------------------------
// I18n Lang Store
//------------------------------------------------------------------------------

export const i18nLangStore = createLocalStore("i18n.lang", "en", z.string().parse);

//------------------------------------------------------------------------------
// Use I18n Lang
//------------------------------------------------------------------------------

export function useI18nLang() {
  const context = useI18nLangProviderContext();
  return [context.lang, context.setLang] as const;
}
