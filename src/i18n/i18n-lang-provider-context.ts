import { createContext, useContext } from "react";
import type { StateSetter } from "~/utils/state";

//------------------------------------------------------------------------------
// I18n Lang Provider Value
//------------------------------------------------------------------------------

export type I18nLangProviderValue = {
  lang: string;
  setLang: StateSetter<string>;
};

const defaultI18nLangProviderValue: I18nLangProviderValue = {
  lang: "en",
  setLang: () => "en",
};

//------------------------------------------------------------------------------
// I18n Lang Provider Context
//------------------------------------------------------------------------------

export const i18nLangProviderContext = createContext(defaultI18nLangProviderValue);

//------------------------------------------------------------------------------
// Use I18n Lang Provider Context
//------------------------------------------------------------------------------

export function useI18nLangProviderContext(): I18nLangProviderValue {
  return useContext(i18nLangProviderContext);
}
