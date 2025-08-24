import { useCallback, useMemo } from "react";
import { type I18nLang, type I18nLangContext, useI18nLang } from "./i18n-lang";

//------------------------------------------------------------------------------
// I18n
//------------------------------------------------------------------------------

function i(text: string, ...args: string[]) {
  return text.replace(/<(\d+)>/g, (_, index) => args[+index - 1] ?? "");
}

const i18n = {
  t: (context: I18nLangContext, lang: I18nLang, key: string): string => {
    const base = context[key] ?? {};
    return base[lang] ?? base.en ?? key;
  },

  tp: (
    context: I18nLangContext,
    lang: I18nLang,
    key: string,
    count: number
  ): string => {
    const base = context[`${key}/${count}`] ?? context[`${key}/*`] ?? {};
    return base[lang] ?? base.en ?? key;
  },

  ti: (
    context: I18nLangContext,
    lang: I18nLang,
    key: string,
    ...args: string[]
  ): string => {
    const base = context[key] ?? {};
    return i(base[lang] ?? base.en ?? key, ...args);
  },

  tpi: (
    context: I18nLangContext,
    lang: I18nLang,
    key: string,
    count: number,
    ...args: string[]
  ): string => {
    const base = context[`${key}/${count}`] ?? context[`${key}/*`] ?? {};
    return i(base[lang] ?? base.en ?? key, ...args);
  },
};

export default i18n;

//------------------------------------------------------------------------------
// Use I18n
//------------------------------------------------------------------------------

export function useI18n(context: I18nLangContext) {
  const [lang] = useI18nLang();

  const t = useCallback(
    (key: string) => i18n.t(context, lang, key),
    [context, lang]
  );

  const tp = useCallback(
    (key: string, count: number) => i18n.tp(context, lang, key, count),
    [context, lang]
  );

  const ti = useCallback(
    (key: string, ...args: string[]) => i18n.ti(context, lang, key, ...args),
    [context, lang]
  );

  const tpi = useCallback(
    (key: string, count: number, ...args: string[]) =>
      i18n.tpi(context, lang, key, count, ...args),
    [context, lang]
  );

  return useMemo(() => ({ lang, t, ti, tp, tpi }), [lang, t, tp, ti, tpi]);
}

export type I18n = ReturnType<typeof useI18n>;
