import { useMemo, type ReactNode } from "react";
import { i18nLangStore } from "./i18n-lang";
import { i18nLangProviderContext } from "./i18n-lang-provider-context";

//------------------------------------------------------------------------------
// App I18n Provider
//------------------------------------------------------------------------------

export default function AppI18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = i18nLangStore.use();
  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return (
    <i18nLangProviderContext.Provider value={value}>{children}</i18nLangProviderContext.Provider>
  );
}
